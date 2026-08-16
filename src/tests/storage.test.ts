import { describe, expect, test } from "vitest";
import { readStoredCompany } from "@/lib/storage";

describe("local storage recovery", () => {
  test("corrupted storage falls back without crashing", () => {
    const state = readStoredCompany("{not-json");
    expect(state.schemaVersion).toBe(1);
    expect(state.workers).toHaveLength(1);
  });

  test("wrong schema falls back to a new company", () => {
    const state = readStoredCompany(JSON.stringify({ schemaVersion: 999 }));
    expect(state.businessPlan.businessName).toBe("教育事業");
  });
});
