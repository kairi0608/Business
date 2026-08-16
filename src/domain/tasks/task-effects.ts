import type { BusinessTask, CompanyState, Contract } from "@/domain/company/types";
import { emitEvent } from "@/domain/events/event-engine";
import { recognizeDeliveredRevenue } from "@/domain/finance/financial-engine";
import { applyScenario } from "@/domain/scenarios/apply-scenario";
import { appendTask } from "./task-generator";

function completeRecord(state: CompanyState, task: BusinessTask): CompanyState {
  return {
    ...state,
    tasks: state.tasks.map((item) => item.id === task.id ? {
      ...item,
      status: "completed",
      progressHours: item.requiredHours,
      completedAt: state.clock.elapsedWorkMinutes,
      assignedWorkerId: undefined,
      blockedReason: undefined,
    } : item),
    workers: state.workers.map((worker) => worker.currentTaskId === task.id ? {
      ...worker,
      currentTaskId: undefined,
      status: "thinking",
      statusMinutes: 0,
      actionSummary: `「${task.title}」を完了`,
    } : worker),
  };
}

function completeSalesTask(state: CompanyState, task: BusinessTask): CompanyState {
  const lead = state.leads.find((item) => item.id === task.relatedLeadId);
  if (!lead) return state;
  const label = `問い合わせ #${String(lead.sequence).padStart(3, "0")}`;

  if (task.type === "lead_contact") {
    let next = { ...state, leads: state.leads.map((item) => item.id === lead.id ? { ...item, status: "contacted" as const } : item) };
    next = appendTask(next, { type: "proposal", title: `${label}への提案作成`, department: "sales", priority: 7, requiredHours: 0.75, relatedLeadId: lead.id });
    return emitEvent(next, { type: "lead_contacted", message: `${label}への初回連絡が完了`, tone: "neutral", entityId: lead.id });
  }

  if (task.type === "proposal") {
    let next = { ...state, leads: state.leads.map((item) => item.id === lead.id ? { ...item, status: "proposal" as const } : item) };
    next = appendTask(next, { type: "sales_followup", title: `${label}の提案結果確認`, department: "sales", priority: 8, requiredHours: 0.5, relatedLeadId: lead.id });
    return emitEvent(next, { type: "proposal_completed", message: `${label}がPROPOSALへ進行`, tone: "neutral", entityId: lead.id });
  }

  if (task.type === "sales_followup") {
    const conversionRate = applyScenario(state.businessPlan, state.scenario).product.conversionRate;
    if (lead.marketSample >= conversionRate) {
      const next = { ...state, leads: state.leads.map((item) => item.id === lead.id ? { ...item, status: "lost" as const } : item) };
      return emitEvent(next, { type: "contract_lost", message: `${label}は市場条件によりLOST`, tone: "warning", entityId: lead.id });
    }

    const sequence = state.contracts.length + 1;
    const contract: Contract = {
      id: `contract-${state.nextEntityId}`,
      sequence,
      leadId: lead.id,
      productId: state.businessPlan.product.id,
      price: state.businessPlan.product.price,
      requiredDeliveryHours: state.businessPlan.product.hoursPerContract,
      status: "signed",
      signedAt: state.clock.elapsedWorkMinutes,
    };
    let next: CompanyState = {
      ...state,
      nextEntityId: state.nextEntityId + 1,
      leads: state.leads.map((item) => item.id === lead.id ? { ...item, status: "won" } : item),
      contracts: [...state.contracts, contract],
    };
    next = appendTask(next, {
      type: "service_preparation",
      title: `教育契約 #${String(sequence).padStart(3, "0")} の授業準備`,
      department: "service",
      priority: 9,
      requiredHours: 0.5,
      relatedContractId: contract.id,
      relatedLeadId: lead.id,
    });
    next = appendTask(next, {
      type: "service_delivery",
      title: `教育契約 #${String(sequence).padStart(3, "0")} のサービス提供`,
      department: "service",
      priority: 10,
      requiredHours: contract.requiredDeliveryHours,
      status: "blocked",
      blockedReason: "dependency",
      relatedContractId: contract.id,
      relatedLeadId: lead.id,
    });
    return emitEvent(next, {
      type: "contract_won",
      message: `契約 #${String(sequence).padStart(3, "0")} が成立。提供Taskを生成`,
      tone: "success",
      entityId: contract.id,
    });
  }
  return state;
}

function completeServiceTask(state: CompanyState, task: BusinessTask): CompanyState {
  const contract = state.contracts.find((item) => item.id === task.relatedContractId);
  if (!contract) return state;
  if (task.type === "service_preparation") {
    const next: CompanyState = {
      ...state,
      contracts: state.contracts.map((item) => item.id === contract.id ? { ...item, status: "in_delivery" } : item),
      tasks: state.tasks.map((item) => item.relatedContractId === contract.id && item.type === "service_delivery" && item.status === "blocked"
        ? { ...item, status: "queued", blockedReason: undefined }
        : item),
    };
    return emitEvent(next, { type: "service_started", message: `契約 #${String(contract.sequence).padStart(3, "0")} の提供準備が完了`, tone: "neutral", entityId: contract.id });
  }
  if (task.type === "service_delivery") {
    let next: CompanyState = {
      ...state,
      contracts: state.contracts.map((item) => item.id === contract.id ? { ...item, status: "delivered", deliveredAt: state.clock.elapsedWorkMinutes } : item),
    };
    next = emitEvent(next, { type: "service_delivered", message: `契約 #${String(contract.sequence).padStart(3, "0")} をDELIVERED`, tone: "success", entityId: contract.id });
    next = recognizeDeliveredRevenue(next, contract);
    return appendTask(next, {
      type: "billing",
      title: `契約 #${String(contract.sequence).padStart(3, "0")} の請求記録`,
      department: "admin",
      priority: 7,
      requiredHours: 0.25,
      relatedContractId: contract.id,
    });
  }
  return state;
}

export function resolveCompletedTask(state: CompanyState, taskId: string): CompanyState {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || task.status === "completed") return state;
  let next = completeRecord(state, task);
  next = emitEvent(next, {
    type: "task_completed",
    message: `${state.workers.find((worker) => worker.id === task.assignedWorkerId)?.name ?? "Worker"}が「${task.title}」を完了`,
    tone: "success",
    entityId: task.id,
  });
  if (task.type === "lead_contact" || task.type === "proposal" || task.type === "sales_followup") next = completeSalesTask(next, task);
  if (task.type === "service_preparation" || task.type === "service_delivery") next = completeServiceTask(next, task);
  if (task.type === "product_development" || task.type === "ai_development") {
    next = {
      ...next,
      products: next.products.map((product) => product.id === next.businessPlan.product.id ? {
        ...product,
        developmentProgressHours: product.developmentProgressHours + (task.type === "product_development" ? task.requiredHours : 0),
        aiDevelopmentProgressHours: product.aiDevelopmentProgressHours + (task.type === "ai_development" ? task.requiredHours : 0),
      } : product),
    };
  }
  return next;
}

