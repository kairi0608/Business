import { SIMULATION_QUANTUM_MINUTES } from "@/domain/company/defaults";
import type { CompanyState, WorkerAgent } from "@/domain/company/types";
import { emitEvent } from "@/domain/events/event-engine";
import { resolveCompletedTask } from "@/domain/tasks/task-effects";

const MOVE_PER_QUANTUM = 12;

function distance(a: WorkerAgent["position"], b: WorkerAgent["targetPosition"]) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function moveWorkers(state: CompanyState): CompanyState {
  return {
    ...state,
    workers: state.workers.map((worker) => {
      if (worker.status !== "moving") return {
        ...worker,
        statusMinutes: worker.statusMinutes + SIMULATION_QUANTUM_MINUTES,
        consecutiveWorkMinutes: worker.status === "resting" ? 0 : worker.consecutiveWorkMinutes,
      };
      const remaining = distance(worker.position, worker.targetPosition);
      if (remaining <= MOVE_PER_QUANTUM) {
        const task = worker.currentTaskId ? state.tasks.find((item) => item.id === worker.currentTaskId) : undefined;
        return {
          ...worker,
          position: { ...worker.targetPosition },
          status: task ? (task.department === "meeting" ? "meeting" : "working") : "resting",
          statusMinutes: 0,
        };
      }
      const ratio = MOVE_PER_QUANTUM / Math.max(remaining, 0.001);
      return {
        ...worker,
        position: {
          x: worker.position.x + (worker.targetPosition.x - worker.position.x) * ratio,
          y: worker.position.y + (worker.targetPosition.y - worker.position.y) * ratio,
        },
        statusMinutes: worker.statusMinutes + SIMULATION_QUANTUM_MINUTES,
      };
    }),
  };
}

export function progressWorkerTask(state: CompanyState, workerId: string): CompanyState {
  const worker = state.workers.find((item) => item.id === workerId);
  if (!worker?.currentTaskId || (worker.status !== "working" && worker.status !== "meeting")) return state;
  const task = state.tasks.find((item) => item.id === worker.currentTaskId);
  if (!task || task.status !== "active") return state;
  const capacityRemaining = Math.max(0, worker.monthlyCapacityHours - worker.usedHours);
  if (capacityRemaining <= 0) {
    let next: CompanyState = {
      ...state,
      tasks: state.tasks.map((item) => item.id === task.id ? { ...item, status: "blocked", blockedReason: "capacity", assignedWorkerId: undefined } : item),
      workers: state.workers.map((item) => item.id === worker.id ? { ...item, currentTaskId: undefined, status: "idle", actionSummary: "今月のCapacity上限に到達" } : item),
    };
    return emitEvent(next, { type: "task_blocked", message: `「${task.title}」はFounder Capacity上限で停止`, tone: "warning", entityId: task.id });
  }

  const taskRemaining = Math.max(0, task.requiredHours - task.progressHours);
  const worked = Math.min(SIMULATION_QUANTUM_MINUTES / 60, capacityRemaining, taskRemaining);
  const progress = task.progressHours + worked;
  let next: CompanyState = {
    ...state,
    tasks: state.tasks.map((item) => item.id === task.id ? { ...item, progressHours: progress } : item),
    workers: state.workers.map((item) => item.id === worker.id ? {
      ...item,
      usedHours: item.usedHours + worked,
      workload: item.monthlyCapacityHours <= 0 ? 100 : Math.min(100, ((item.usedHours + worked) / item.monthlyCapacityHours) * 100),
      consecutiveWorkMinutes: item.consecutiveWorkMinutes + worked * 60,
      statusMinutes: item.statusMinutes + SIMULATION_QUANTUM_MINUTES,
      todayHours: { ...item.todayHours, [task.department]: item.todayHours[task.department] + worked },
    } : item),
  };
  if (progress + 1e-9 >= task.requiredHours) next = resolveCompletedTask(next, task.id);
  return next;
}

