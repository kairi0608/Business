import { afterEach, describe, expect, test, vi } from "vitest";
import { STORAGE_KEY } from "@/lib/storage";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("Zustand company persistence", () => {
  test("company state, strategy, and speed restore after store recreation", async () => {
    const storage = new MemoryStorage();
    vi.stubGlobal("localStorage", storage);
    vi.resetModules();
    const firstModule = await import("@/store/company-store");
    firstModule.useCompanyStore.getState().hydrate();
    firstModule.useCompanyStore.getState().setStrategy("growth_first");
    firstModule.useCompanyStore.getState().setSpeed(0);
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();

    vi.resetModules();
    const secondModule = await import("@/store/company-store");
    secondModule.useCompanyStore.getState().hydrate();
    expect(secondModule.useCompanyStore.getState().company.management.strategy).toBe("growth_first");
    expect(secondModule.useCompanyStore.getState().company.clock.speed).toBe(0);
  });

  test("corrupted persisted JSON falls back without crashing the store", async () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, "{broken-json");
    vi.stubGlobal("localStorage", storage);
    vi.resetModules();
    const module = await import("@/store/company-store");
    expect(() => module.useCompanyStore.getState().hydrate()).not.toThrow();
    expect(module.useCompanyStore.getState().company.businessPlan.businessName).toBe("教育事業");
    expect(module.useCompanyStore.getState().company.workers).toHaveLength(1);
  });
});
