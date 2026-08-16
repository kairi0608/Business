import { describe, expect, test } from "vitest";
import { createInitialCompanyState, DEFAULT_PLAN, ZONE_POSITIONS, WORK_DAYS_PER_MONTH, WORKDAY_END, WORKDAY_START } from "@/domain/company/defaults";
import { selectBacklog } from "@/domain/company/selectors";
import type { BusinessTask, CompanyState, Contract, Lead } from "@/domain/company/types";
import { applyManagementStrategy } from "@/domain/management/rule-based-ceo";
import { advanceVirtualMinutes, stepSimulation } from "@/domain/simulation/simulation-engine";
import { resolveCompletedTask } from "@/domain/tasks/task-effects";

const WORKDAY_MINUTES = WORKDAY_END - WORKDAY_START;

function deliveryState(requiredHours = 2, capacityHours = 300): CompanyState {
  const state = createInitialCompanyState();
  const lead: Lead = { id: "lead-test", sequence: 1, month: 1, status: "won", marketSample: 0.1, createdAt: 0 };
  const contract: Contract = { id: "contract-test", sequence: 1, leadId: lead.id, productId: state.businessPlan.product.id, price: 10_000, requiredDeliveryHours: requiredHours, status: "in_delivery", signedAt: 0 };
  const task: BusinessTask = { id: "task-delivery", type: "service_delivery", title: "教育契約 #001 のサービス提供", department: "service", priority: 10, requiredHours, progressHours: 0, status: "active", assignedWorkerId: "worker-founder", relatedLeadId: lead.id, relatedContractId: contract.id, createdAt: 0 };
  return {
    ...state,
    leads: [lead],
    contracts: [contract],
    tasks: [task],
    generatedExternalEventKeys: ["learning-experiment:1"],
    workers: state.workers.map((worker) => ({ ...worker, currentTaskId: task.id, status: "working", position: { ...ZONE_POSITIONS.service }, targetPosition: { ...ZONE_POSITIONS.service }, targetZone: "service", monthlyCapacityHours: capacityHours, actionSummary: "教育サービスを提供中" })),
  };
}

describe("causal business simulation", () => {
  test("unfinished delivery does not recognize revenue", () => {
    const state = advanceVirtualMinutes(deliveryState(), 60);
    expect(state.tasks[0].progressHours).toBeCloseTo(1);
    expect(state.finances.recognizedRevenue).toBe(0);
    expect(state.contracts[0].status).toBe("in_delivery");
  });

  test("completed delivery marks the contract delivered and recognizes revenue", () => {
    const state = advanceVirtualMinutes(deliveryState(), 120);
    expect(state.contracts[0].status).toBe("delivered");
    expect(state.finances.recognizedRevenue).toBe(10_000);
    expect(state.events.some((event) => event.type === "revenue_recognized")).toBe(true);
  });

  test("service tasks do not exist before a lead wins", () => {
    const source = createInitialCompanyState();
    const lead: Lead = { id: "lead-test", sequence: 1, month: 1, status: "new", marketSample: 0.1, createdAt: 0 };
    const contact: BusinessTask = { id: "contact", type: "lead_contact", title: "初回確認", department: "sales", priority: 8, requiredHours: 0.5, progressHours: 0.5, status: "active", assignedWorkerId: "worker-founder", relatedLeadId: lead.id, createdAt: 0 };
    const contacted = resolveCompletedTask({ ...source, leads: [lead], tasks: [contact], workers: source.workers.map((worker) => ({ ...worker, currentTaskId: contact.id })) }, contact.id);
    expect(contacted.leads[0].status).toBe("contacted");
    expect(contacted.tasks.some((task) => task.department === "service")).toBe(false);
    const proposal = contacted.tasks.find((task) => task.type === "proposal")!;
    const proposed = resolveCompletedTask({ ...contacted, tasks: contacted.tasks.map((task) => task.id === proposal.id ? { ...task, status: "active", assignedWorkerId: "worker-founder" } : task) }, proposal.id);
    expect(proposed.leads[0].status).toBe("proposal");
    expect(proposed.tasks.some((task) => task.department === "service")).toBe(false);
  });

  test("founder never works beyond monthly capacity", () => {
    const state = advanceVirtualMinutes(deliveryState(2, 0.5), 60);
    expect(state.workers[0].usedHours).toBeLessThanOrEqual(0.5);
    expect(state.finances.recognizedRevenue).toBe(0);
    expect(state.tasks[0].status).toBe("blocked");
    expect(state.tasks[0].blockedReason).toBe("capacity");
  });

  test("pause freezes clock, movement, tasks, and business state", () => {
    const source = createInitialCompanyState();
    source.clock.speed = 0;
    expect(stepSimulation(source, 2)).toBe(source);
  });

  test("1x / 2x / 4x produce the same state for equal virtual time", () => {
    const one = createInitialCompanyState();
    one.clock.speed = 1;
    const two = createInitialCompanyState();
    two.clock.speed = 2;
    const four = createInitialCompanyState();
    four.clock.speed = 4;
    const a = stepSimulation(one, 2);
    const b = stepSimulation(two, 1);
    const c = stepSimulation(four, 0.5);
    const withoutSpeed = (state: CompanyState) => ({ ...state, clock: { ...state.clock, speed: 1 as const } });
    expect(withoutSpeed(a)).toEqual(withoutSpeed(b));
    expect(withoutSpeed(a)).toEqual(withoutSpeed(c));
  });

  test("worker moves toward the zone required by the selected task", () => {
    const state = createInitialCompanyState();
    const salesTask: BusinessTask = { id: "sales-task", type: "lead_contact", title: "問い合わせ確認", department: "sales", priority: 10, requiredHours: 1, progressHours: 0, status: "queued", createdAt: 0 };
    const source = { ...state, tasks: [salesTask], generatedExternalEventKeys: ["learning-experiment:1"] };
    const next = advanceVirtualMinutes(source, 5);
    expect(next.workers[0].targetZone).toBe("sales");
    expect(next.workers[0].position.x).toBeLessThan(state.workers[0].position.x);
  });

  test("backlog is exactly the count of unfinished business tasks", () => {
    const state = createInitialCompanyState();
    const completed = { ...state.tasks[0], id: "done", status: "completed" as const };
    const queued = { ...state.tasks[0], id: "queued", status: "queued" as const };
    const blocked = { ...state.tasks[0], id: "blocked", status: "blocked" as const };
    const actual = selectBacklog({ ...state, tasks: [completed, queued, blocked] });
    expect(actual.total).toBe(2);
    expect(actual.byDepartment.meeting).toBe(2);
  });

  test("Worker AI and AI CEO cannot mutate financial state", () => {
    const source = createInitialCompanyState();
    const finances = structuredClone(source.finances);
    const managed = applyManagementStrategy(source, "growth_first");
    expect(managed.finances).toEqual(finances);
    const moved = advanceVirtualMinutes({ ...source, generatedExternalEventKeys: ["learning-experiment:1"] }, 5);
    expect(moved.finances).toEqual(finances);
  });

  test("AI CEO strategy does not rewrite the market scenario", () => {
    const source = { ...createInitialCompanyState(), scenario: "conservative" as const };
    const next = applyManagementStrategy(source, "profit_first");
    expect(next.scenario).toBe("conservative");
  });

  test("same plan, scenario, seed, and strategy are deterministic", () => {
    const first = advanceVirtualMinutes(createInitialCompanyState(DEFAULT_PLAN, 149), WORKDAY_MINUTES * 5);
    const second = advanceVirtualMinutes(createInitialCompanyState(DEFAULT_PLAN, 149), WORKDAY_MINUTES * 5);
    expect(first).toEqual(second);
    expect(first.leads.length).toBe(1);
    expect(first.contracts[0]?.status).toBe("delivered");
    expect(first.finances.recognizedRevenue).toBe(10_000);
  });

  test("monthly leads and fixed cost flow into actual company state", () => {
    const state = advanceVirtualMinutes(createInitialCompanyState(), WORKDAY_MINUTES * WORK_DAYS_PER_MONTH);
    expect(state.leads.filter((lead) => lead.month === 1)).toHaveLength(2);
    expect(state.history.monthly[0].leads).toBe(2);
    expect(state.finances.fixedCosts).toBe(10_000);
    expect(state.finances.cash).toBe(1_000_000);
  });
});

