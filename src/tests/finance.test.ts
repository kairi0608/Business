import { describe, expect, test } from "vitest";
import { createInitialCompanyState, DEFAULT_PLAN } from "@/domain/company/defaults";
import { calculateBreakEven } from "@/domain/finance/break-even";
import { applyScenario } from "@/domain/scenarios/apply-scenario";

describe("planning and finance boundaries", () => {
  test("unknown variable cost remains a partial model instead of becoming zero", () => {
    const state = createInitialCompanyState();
    expect(state.businessPlan.product.variableCostPerContract).toBeUndefined();
    expect(state.finances.variableCosts).toBeUndefined();
    expect(calculateBreakEven(state.businessPlan).partialModel).toBe(true);
  });

  test("scenario application does not mutate user plan", () => {
    const source = structuredClone(DEFAULT_PLAN);
    const optimistic = applyScenario(source, "optimistic");
    expect(source).toEqual(DEFAULT_PLAN);
    expect(optimistic.product.monthlyLeads).toBeGreaterThan(source.product.monthlyLeads);
  });
});

