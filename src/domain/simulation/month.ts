import { WORKDAY_START } from "@/domain/company/defaults";
import { selectBacklog, selectMonthEntities } from "@/domain/company/selectors";
import type { CompanyState } from "@/domain/company/types";
import { emitEvent } from "@/domain/events/event-engine";
import { closeFinancialMonth, resetMonthlyFinancialCounters } from "@/domain/finance/financial-engine";
import { applyManagementStrategy, decideManagementPolicy } from "@/domain/management/rule-based-ceo";
import { appendMonthCloseTasks } from "@/domain/tasks/task-generator";

export function closeMonth(state: CompanyState): CompanyState {
  const closedMonth = state.clock.month;
  let next = closeFinancialMonth(state);
  const monthEntities = selectMonthEntities(next, closedMonth);
  const knownCost = next.finances.currentMonthFixedCost + (next.finances.currentMonthVariableCost ?? 0);
  const monthlyResult = {
    month: closedMonth,
    leads: monthEntities.leads.length,
    contracts: monthEntities.contracts.length,
    deliveredContracts: monthEntities.contracts.filter((contract) => contract.status === "delivered").length,
    revenue: next.finances.currentMonthRevenue,
    knownCost,
    knownProfit: next.finances.currentMonthRevenue - knownCost,
    endingCash: next.finances.cash,
    capacityHours: next.workers.reduce((sum, worker) => sum + worker.usedHours, 0),
    backlog: selectBacklog(next).total,
  };
  next = { ...next, history: { ...next.history, monthly: [...next.history.monthly, monthlyResult] } };
  next = emitEvent(next, {
    type: "monthly_review",
    message: `Month ${closedMonth} 締め：売上 ${monthlyResult.revenue.toLocaleString("ja-JP")}円 / 既知利益 ${monthlyResult.knownProfit.toLocaleString("ja-JP")}円`,
    tone: monthlyResult.knownProfit >= 0 ? "success" : "warning",
  });

  const decision = decideManagementPolicy(next);
  next = applyManagementStrategy(next, next.management.strategy);
  next = {
    ...next,
    management: { ...next.management, lastReviewMonth: closedMonth, currentPriority: decision.priority, rationale: decision.rationale },
    clock: { ...next.clock, month: closedMonth + 1, day: 1, minuteOfDay: WORKDAY_START },
    workers: next.workers.map((worker) => ({
      ...worker,
      monthlyCapacityHours: next.businessPlan.founderMonthlyCapacityHours,
      usedHours: 0,
      workload: 0,
      todayHours: { sales: 0, service: 0, product: 0, admin: 0, meeting: 0 },
    })),
    tasks: next.tasks.map((task) => task.status === "blocked" && task.blockedReason === "capacity"
      ? { ...task, status: "queued", blockedReason: undefined }
      : task),
  };
  next = resetMonthlyFinancialCounters(next);
  next = appendMonthCloseTasks(next, closedMonth);
  return emitEvent(next, {
    type: "management_decision",
    message: `AI CEO: Month ${closedMonth + 1} は ${decision.priority.toUpperCase()} を優先`,
    tone: "neutral",
  });
}

