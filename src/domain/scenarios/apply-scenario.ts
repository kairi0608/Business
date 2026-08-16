import type { BusinessPlan, ScenarioId } from "@/domain/company/types";

const scenarioFactors: Record<ScenarioId, { leads: number; conversion: number }> = {
  conservative: { leads: 0.75, conversion: 0.8 },
  base: { leads: 1, conversion: 1 },
  optimistic: { leads: 1.35, conversion: 1.2 },
};

export function applyScenario(plan: BusinessPlan, scenario: ScenarioId): BusinessPlan {
  const factors = scenarioFactors[scenario];
  return {
    ...plan,
    product: {
      ...plan.product,
      monthlyLeads: plan.product.monthlyLeads * factors.leads,
      conversionRate: Math.min(1, plan.product.conversionRate * factors.conversion),
    },
  };
}

