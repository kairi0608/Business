import type { CompanyState, Contract } from "@/domain/company/types";
import { emitEvent } from "@/domain/events/event-engine";

function totals(state: CompanyState, patch: Partial<CompanyState["finances"]>): CompanyState["finances"] {
  const finances = { ...state.finances, ...patch };
  finances.knownProfit = finances.recognizedRevenue - finances.knownCosts;
  finances.cashShortage = finances.cash < 0;
  return finances;
}

export function recognizeDeliveredRevenue(state: CompanyState, contract: Contract): CompanyState {
  const variableUnitCost = state.businessPlan.product.variableCostPerContract;
  let next: CompanyState = {
    ...state,
    finances: totals(state, {
      cash: state.finances.cash + contract.price - (variableUnitCost ?? 0),
      recognizedRevenue: state.finances.recognizedRevenue + contract.price,
      knownCosts: state.finances.knownCosts + (variableUnitCost ?? 0),
      variableCosts: variableUnitCost === undefined ? undefined : (state.finances.variableCosts ?? 0) + variableUnitCost,
      currentMonthRevenue: state.finances.currentMonthRevenue + contract.price,
      currentMonthVariableCost: variableUnitCost === undefined ? undefined : (state.finances.currentMonthVariableCost ?? 0) + variableUnitCost,
    }),
  };
  next = emitEvent(next, {
    type: "revenue_recognized",
    message: `教育サービスの提供完了により売上 ${contract.price.toLocaleString("ja-JP")}円を認識`,
    tone: "finance",
    entityId: contract.id,
    amount: contract.price,
  });
  if (variableUnitCost !== undefined && variableUnitCost > 0) {
    next = emitEvent(next, {
      type: "expense_recorded",
      message: `契約変動費 ${variableUnitCost.toLocaleString("ja-JP")}円を計上`,
      tone: "finance",
      entityId: contract.id,
      amount: -variableUnitCost,
    });
  }
  return next;
}

export function closeFinancialMonth(state: CompanyState): CompanyState {
  const fixedCost = state.businessPlan.monthlyFixedCost;
  let next: CompanyState = {
    ...state,
    finances: totals(state, {
      cash: state.finances.cash - fixedCost,
      knownCosts: state.finances.knownCosts + fixedCost,
      fixedCosts: state.finances.fixedCosts + fixedCost,
      currentMonthFixedCost: fixedCost,
    }),
  };
  next = emitEvent(next, {
    type: "expense_recorded",
    message: `月次固定費 ${fixedCost.toLocaleString("ja-JP")}円を計上`,
    tone: "finance",
    amount: -fixedCost,
  });
  return next;
}

export function resetMonthlyFinancialCounters(state: CompanyState): CompanyState {
  return {
    ...state,
    finances: {
      ...state.finances,
      currentMonthRevenue: 0,
      currentMonthFixedCost: 0,
      currentMonthVariableCost: state.businessPlan.product.variableCostPerContract === undefined ? undefined : 0,
      partialModel: state.businessPlan.product.variableCostPerContract === undefined,
    },
  };
}

