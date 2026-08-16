import { WORK_DAYS_PER_MONTH, WORKDAY_END, WORKDAY_START } from "@/domain/company/defaults";
import { selectBacklog } from "@/domain/company/selectors";
import type { CompanyState } from "@/domain/company/types";
import { emitEvent } from "@/domain/events/event-engine";
import { closeMonth } from "./month";

export function advanceClockAndReviews(state: CompanyState, minutes: number): CompanyState {
  let next: CompanyState = {
    ...state,
    clock: {
      ...state.clock,
      minuteOfDay: state.clock.minuteOfDay + minutes,
      elapsedWorkMinutes: state.clock.elapsedWorkMinutes + minutes,
    },
  };
  if (next.clock.minuteOfDay < WORKDAY_END) return next;

  const dayStartElapsed = next.clock.elapsedWorkMinutes - (WORKDAY_END - WORKDAY_START);
  const completedTasks = next.tasks.filter((task) => task.completedAt !== undefined && task.completedAt >= dayStartElapsed && task.completedAt <= next.clock.elapsedWorkMinutes).length;
  const hoursWorked = next.workers.reduce((sum, worker) => sum + Object.values(worker.todayHours).reduce((value, hours) => value + hours, 0), 0);
  const daily = { month: next.clock.month, day: next.clock.day, completedTasks, hoursWorked, backlog: selectBacklog(next).total };
  next = { ...next, history: { ...next.history, daily: [...next.history.daily.slice(-89), daily] } };
  next = emitEvent(next, {
    type: "daily_review",
    message: `Day ${next.clock.day} 終了：${completedTasks} Tasks / ${hoursWorked.toFixed(1)}h / Backlog ${daily.backlog}`,
    tone: "neutral",
  });

  if (next.clock.day >= WORK_DAYS_PER_MONTH) return closeMonth(next);
  return {
    ...next,
    clock: { ...next.clock, day: next.clock.day + 1, minuteOfDay: WORKDAY_START },
    workers: next.workers.map((worker) => ({
      ...worker,
      todayHours: { sales: 0, service: 0, product: 0, admin: 0, meeting: 0 },
      consecutiveWorkMinutes: 0,
    })),
  };
}
