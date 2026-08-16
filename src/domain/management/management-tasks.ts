import type { CompanyState } from "@/domain/company/types";
import { WORKDAY_START } from "@/domain/company/defaults";
import { emitEvent } from "@/domain/events/event-engine";
import { appendTask } from "@/domain/tasks/task-generator";

export function generateStrategyTasks(state: CompanyState): CompanyState {
  if (state.clock.day !== 1 || state.clock.minuteOfDay !== WORKDAY_START || state.management.strategy !== "learning_first") return state;
  const key = `learning-experiment:${state.clock.month}`;
  if (state.generatedExternalEventKeys.includes(key)) return state;
  let next: CompanyState = {
    ...state,
    generatedExternalEventKeys: [...state.generatedExternalEventKeys, key],
  };
  next = appendTask(next, {
    type: "product_development",
    title: `${state.businessPlan.product.name}の学習仮説を改善`,
    department: "product",
    priority: 5,
    requiredHours: 1.5,
  });
  return emitEvent(next, {
    type: "experiment_created",
    message: "Learning First方針から、教育プログラム改善Experimentを作成",
    tone: "neutral",
  });
}

