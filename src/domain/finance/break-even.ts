import type { BusinessPlan } from "@/domain/company/types";

export interface BreakEvenResult {
  possible: boolean;
  contracts: number | null;
  leads: number | null;
  contributionMargin: number;
  partialModel: boolean;
}

export function calculateBreakEven(plan: BusinessPlan): BreakEvenResult {
  const partialModel = plan.product.variableCostPerContract === undefined;
  const contributionMargin = plan.product.price - (plan.product.variableCostPerContract ?? 0);
  if (contributionMargin <= 0 || plan.product.conversionRate <= 0) {
    return { possible: false, contracts: null, leads: null, contributionMargin, partialModel };
  }
  const contracts = plan.monthlyFixedCost / contributionMargin;
  return { possible: true, contracts, leads: contracts / plan.product.conversionRate, contributionMargin, partialModel };
}

