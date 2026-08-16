import type { CompanyState, WorkDepartment } from "./types";

export function selectBacklog(state: CompanyState) {
  const open = state.tasks.filter((task) => task.status === "queued" || task.status === "active" || task.status === "blocked");
  const byDepartment: Record<WorkDepartment, number> = { sales: 0, service: 0, product: 0, admin: 0, meeting: 0 };
  for (const task of open) byDepartment[task.department] += 1;
  return { total: open.length, byDepartment };
}

export function selectCurrentTask(state: CompanyState, workerId: string) {
  const worker = state.workers.find((item) => item.id === workerId);
  return worker?.currentTaskId ? state.tasks.find((task) => task.id === worker.currentTaskId) : undefined;
}

export function selectMonthEntities(state: CompanyState, month = state.clock.month) {
  const leads = state.leads.filter((lead) => lead.month === month);
  const contracts = state.contracts.filter((contract) => {
    const lead = state.leads.find((item) => item.id === contract.leadId);
    return lead?.month === month;
  });
  return { leads, contracts };
}

