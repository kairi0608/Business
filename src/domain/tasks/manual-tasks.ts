import type { BusinessTaskType, CompanyState } from "@/domain/company/types";
import { emitEvent } from "@/domain/events/event-engine";
import { appendTask } from "./task-generator";

export function addDevelopmentTask(state: CompanyState, type: Extract<BusinessTaskType, "product_development" | "ai_development">): CompanyState {
  const isAi = type === "ai_development";
  let next = appendTask(state, {
    type,
    title: isAi ? "教育支援AIのPrototype改善" : `${state.businessPlan.product.name}の教材改善`,
    department: "product",
    priority: 5,
    requiredHours: 2,
  });
  next = emitEvent(next, {
    type: "experiment_created",
    message: `${isAi ? "AI開発" : "商品改善"}Taskをユーザー操作で追加`,
    tone: "neutral",
  });
  return next;
}
