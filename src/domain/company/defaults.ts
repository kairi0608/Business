import type { BusinessPlan, BusinessTask, CompanyState, WorkerAgent } from "./types";

export const WORKDAY_START = 9 * 60;
export const WORKDAY_END = 18 * 60;
export const WORK_DAYS_PER_MONTH = 22;
export const SIMULATION_QUANTUM_MINUTES = 5;
export const SIMULATION_MINUTES_PER_REAL_SECOND = 90;

export const ZONE_POSITIONS = {
  sales: { x: 17, y: 25 },
  service: { x: 51, y: 24 },
  product: { x: 83, y: 25 },
  admin: { x: 17, y: 72 },
  meeting: { x: 51, y: 70 },
  lounge: { x: 83, y: 72 },
} as const;

export const DEFAULT_PLAN: BusinessPlan = {
  businessName: "教育事業",
  startingCash: 1_000_000,
  monthlyLossTolerance: 200_000,
  founderMonthlyCapacityHours: 300,
  monthlyFixedCost: 10_000,
  product: {
    id: "product-education-1to1",
    name: "1対1教育",
    price: 10_000,
    monthlyLeads: 2,
    conversionRate: 0.25,
    hoursPerContract: 2,
    variableCostPerContract: undefined,
  },
  sources: {
    businessName: "user",
    startingCash: "user",
    monthlyLossTolerance: "user",
    founderMonthlyCapacityHours: "user",
    monthlyFixedCost: "user",
    "product.name": "user",
    "product.price": "user",
    "product.monthlyLeads": "user",
    "product.conversionRate": "user",
    "product.hoursPerContract": "user",
    "product.variableCostPerContract": "user",
  },
};

function founder(plan: BusinessPlan): WorkerAgent {
  return {
    id: "worker-founder",
    name: "Founder",
    role: "founder",
    skills: { sales: 76, service: 84, product: 72, admin: 65, management: 80 },
    status: "thinking",
    position: { ...ZONE_POSITIONS.meeting },
    targetPosition: { ...ZONE_POSITIONS.meeting },
    targetZone: "meeting",
    monthlyCapacityHours: plan.founderMonthlyCapacityHours,
    usedHours: 0,
    workload: 0,
    consecutiveWorkMinutes: 0,
    statusMinutes: 0,
    todayHours: { sales: 0, service: 0, product: 0, admin: 0, meeting: 0 },
    actionSummary: "今日の方針を確認しよう",
  };
}

function kickoffTask(): BusinessTask {
  return {
    id: "task-kickoff-review",
    type: "management_review",
    title: "創業時の経営方針レビュー",
    department: "meeting",
    priority: 9,
    requiredHours: 0.5,
    progressHours: 0,
    status: "queued",
    createdAt: 0,
  };
}

export function createInitialCompanyState(plan: BusinessPlan = DEFAULT_PLAN, seed = 149): CompanyState {
  const initialPlan = structuredClone(plan);
  return {
    schemaVersion: 1,
    seed,
    nextEntityId: 1,
    clock: { month: 1, day: 1, minuteOfDay: WORKDAY_START, elapsedWorkMinutes: 0, speed: 1, tickRemainderMinutes: 0 },
    finances: {
      cash: initialPlan.startingCash,
      recognizedRevenue: 0,
      knownCosts: 0,
      knownProfit: 0,
      fixedCosts: 0,
      variableCosts: initialPlan.product.variableCostPerContract === undefined ? undefined : 0,
      currentMonthRevenue: 0,
      currentMonthFixedCost: 0,
      currentMonthVariableCost: initialPlan.product.variableCostPerContract === undefined ? undefined : 0,
      cashShortage: initialPlan.startingCash < 0,
      partialModel: initialPlan.product.variableCostPerContract === undefined,
    },
    businessPlan: initialPlan,
    scenario: "base",
    leads: [],
    contracts: [],
    products: [{ ...initialPlan.product, developmentProgressHours: 0, aiDevelopmentProgressHours: 0 }],
    workers: [founder(initialPlan)],
    tasks: [kickoffTask()],
    management: {
      strategy: "learning_first",
      currentPriority: "sales",
      rationale: "初期段階では顧客獲得の検証を優先します。",
      targetMonthlyProfit: 200_000,
      lastReviewMonth: 0,
    },
    events: [{
      id: "event-company-started",
      type: "company_started",
      message: `${initialPlan.businessName}をFounder 1名で開始しました`,
      tone: "neutral",
      month: 1,
      day: 1,
      minuteOfDay: WORKDAY_START,
      elapsedWorkMinutes: 0,
    }],
    history: { daily: [], monthly: [] },
    generatedExternalEventKeys: [],
  };
}
