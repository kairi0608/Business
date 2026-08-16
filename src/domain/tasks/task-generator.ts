import type { BusinessTask, BusinessTaskType, CompanyState, WorkDepartment } from "@/domain/company/types";

export interface NewTaskInput {
  type: BusinessTaskType;
  title: string;
  department: WorkDepartment;
  priority: number;
  requiredHours: number;
  status?: BusinessTask["status"];
  blockedReason?: BusinessTask["blockedReason"];
  relatedLeadId?: string;
  relatedContractId?: string;
}

export function appendTask(state: CompanyState, input: NewTaskInput): CompanyState {
  const task: BusinessTask = {
    id: `task-${state.nextEntityId}`,
    type: input.type,
    title: input.title,
    department: input.department,
    priority: input.priority,
    requiredHours: input.requiredHours,
    progressHours: 0,
    status: input.status ?? "queued",
    blockedReason: input.blockedReason,
    relatedLeadId: input.relatedLeadId,
    relatedContractId: input.relatedContractId,
    createdAt: state.clock.elapsedWorkMinutes,
  };
  return { ...state, nextEntityId: state.nextEntityId + 1, tasks: [...state.tasks, task] };
}

export function appendMonthCloseTasks(state: CompanyState, closedMonth: number): CompanyState {
  let next = appendTask(state, {
    type: "accounting",
    title: `Month ${closedMonth} 月次記録の整理`,
    department: "admin",
    priority: 6,
    requiredHours: 0.5,
  });
  next = appendTask(next, {
    type: "management_review",
    title: `Month ${closedMonth} 経営レビュー`,
    department: "meeting",
    priority: 8,
    requiredHours: 0.75,
  });
  return next;
}

