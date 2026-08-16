import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createInitialCompanyState } from "@/domain/company/defaults";
import type { BusinessPlan, CompanyState, ManagementStrategy, ScenarioId, SimulationSpeed } from "@/domain/company/types";
import { applyManagementStrategy } from "@/domain/management/rule-based-ceo";
import { stepSimulation } from "@/domain/simulation/simulation-engine";
import { addDevelopmentTask } from "@/domain/tasks/manual-tasks";
import { isCompanyState, STORAGE_KEY } from "@/lib/storage";

interface CompanyStore {
  company: CompanyState;
  hydrated: boolean;
  hydrate: () => void;
  tick: (realDeltaSeconds: number) => void;
  setSpeed: (speed: SimulationSpeed) => void;
  setStrategy: (strategy: ManagementStrategy) => void;
  setScenario: (scenario: ScenarioId) => void;
  updateBusinessPlan: (plan: BusinessPlan) => void;
  addDevelopmentTask: (type: "product_development" | "ai_development") => void;
  resetCompany: () => void;
}

export const useCompanyStore = create<CompanyStore>()(persist((set) => ({
  company: createInitialCompanyState(),
  hydrated: false,
  hydrate: () => {
    useCompanyStore.persist.rehydrate();
    useCompanyStore.setState({ hydrated: true });
  },
  tick: (realDeltaSeconds) => set(({ company }) => ({ company: stepSimulation(company, realDeltaSeconds) })),
  setSpeed: (speed) => set(({ company }) => ({ company: { ...company, clock: { ...company.clock, speed } } })),
  setStrategy: (strategy) => set(({ company }) => ({ company: applyManagementStrategy(company, strategy) })),
  setScenario: (scenario) => set(({ company }) => ({ company: { ...company, scenario } })),
  updateBusinessPlan: (businessPlan) => set(({ company }) => {
    const variableDefined = businessPlan.product.variableCostPerContract !== undefined;
    const next: CompanyState = {
      ...company,
      businessPlan,
      products: company.products.map((product) => product.id === businessPlan.product.id ? { ...product, ...businessPlan.product } : product),
      workers: company.workers.map((worker) => worker.role === "founder" ? { ...worker, monthlyCapacityHours: businessPlan.founderMonthlyCapacityHours } : worker),
      finances: {
        ...company.finances,
        partialModel: !variableDefined,
        variableCosts: variableDefined ? (company.finances.variableCosts ?? 0) : undefined,
        currentMonthVariableCost: variableDefined ? (company.finances.currentMonthVariableCost ?? 0) : undefined,
      },
    };
    return { company: next };
  }),
  addDevelopmentTask: (type) => set(({ company }) => ({ company: addDevelopmentTask(company, type) })),
  resetCompany: () => {
    void useCompanyStore.persist.clearStorage();
    set({ company: createInitialCompanyState(), hydrated: true });
  },
}), {
  name: STORAGE_KEY,
  version: 1,
  storage: createJSONStorage(() => localStorage),
  skipHydration: true,
  partialize: (store) => ({ company: store.company }) as CompanyStore,
  merge: (persisted, current) => {
    const company = (persisted as Partial<CompanyStore> | undefined)?.company;
    return isCompanyState(company) ? { ...current, company } : current;
  },
}));
