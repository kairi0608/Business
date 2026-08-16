import type { CompanyState, ManagementPriority, ManagementStrategy } from "@/domain/company/types";
import { calculateBreakEven } from "@/domain/finance/break-even";

export interface ManagementDecision {
  priority: ManagementPriority;
  rationale: string;
}

export function decideManagementPolicy(state: CompanyState, strategy: ManagementStrategy = state.management.strategy): ManagementDecision {
  const openService = state.tasks.filter((task) => task.department === "service" && task.status !== "completed" && task.status !== "cancelled").length;
  const breakEven = calculateBreakEven(state.businessPlan);
  const cashRisk = state.finances.cash < state.businessPlan.monthlyLossTolerance;

  if (openService > 0) return { priority: "service", rationale: "契約済みサービスの未提供を解消し、売上認識まで進めます。" };
  if (strategy === "growth_first") return { priority: "sales", rationale: "成長方針に基づき顧客獲得を優先します。" };
  if (strategy === "learning_first") return { priority: "sales", rationale: "初期仮説を検証するため、顧客接点と学習を優先します。" };
  if (strategy === "cash_preservation" || cashRisk) return { priority: "admin", rationale: "Cash余力を守るため、請求・管理と確実な提供を優先します。" };
  if (strategy === "profit_first") return { priority: "service", rationale: "契約を確実に提供し、利益認識を優先します。" };
  if (breakEven.leads !== null && state.businessPlan.product.monthlyLeads < breakEven.leads) {
    return { priority: "sales", rationale: "既知費用ベースの損益分岐に対して問い合わせ数が不足しています。" };
  }
  return { priority: "balanced", rationale: "目立った滞留がないため、部門間のバランスを維持します。" };
}

export function applyManagementStrategy(state: CompanyState, strategy: ManagementStrategy): CompanyState {
  const decision = decideManagementPolicy(state, strategy);
  return {
    ...state,
    management: { ...state.management, strategy, currentPriority: decision.priority, rationale: decision.rationale },
  };
}
