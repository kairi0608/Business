import { ZONE_POSITIONS } from "@/domain/company/defaults";
import type { BusinessTask, CompanyState, OfficeZoneType, WorkerAgent } from "@/domain/company/types";
import { emitEvent } from "@/domain/events/event-engine";

const actionSummary: Record<BusinessTask["type"], string> = {
  lead_contact: "問い合わせを確認しよう",
  sales_followup: "市場の反応を確認しよう",
  proposal: "提案をまとめよう",
  contract_processing: "契約対応を進めよう",
  service_preparation: "授業準備中",
  service_delivery: "教育サービスを提供中",
  customer_followup: "お客様をフォローしよう",
  product_development: "教育プログラムを改善中",
  ai_development: "AIシステムを開発中",
  billing: "請求処理を進めよう",
  accounting: "月次記録を整理しよう",
  management_review: "経営状況をレビューしよう",
};

export function scoreTask(state: CompanyState, worker: WorkerAgent, task: BusinessTask): number {
  const ceoBonus = state.management.currentPriority === task.department ? 6 : state.management.currentPriority === "balanced" ? 1 : 0;
  const serviceCommitment = task.department === "service" ? 2 : 0;
  const age = Math.min(3, (state.clock.elapsedWorkMinutes - task.createdAt) / 540);
  const roleFit = worker.role === "founder" ? 1 : worker.role === task.department ? 2 : 0;
  return task.priority + ceoBonus + serviceCommitment + age + roleFit;
}

export function selectBestTask(state: CompanyState, worker: WorkerAgent): BusinessTask | undefined {
  return state.tasks
    .filter((task) => task.status === "queued" && !task.assignedWorkerId)
    .sort((a, b) => scoreTask(state, worker, b) - scoreTask(state, worker, a) || a.createdAt - b.createdAt || a.id.localeCompare(b.id))[0];
}

function distance(a: WorkerAgent["position"], b: WorkerAgent["position"]) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function evaluateWorker(state: CompanyState, workerId: string): CompanyState {
  const worker = state.workers.find((item) => item.id === workerId);
  if (!worker || worker.currentTaskId) return state;
  if (worker.usedHours >= worker.monthlyCapacityHours) return state;
  const task = selectBestTask(state, worker);
  if (!task) {
    const lounge = ZONE_POSITIONS.lounge;
    const nextStatus = distance(worker.position, lounge) < 1 ? "resting" : "moving";
    return {
      ...state,
      workers: state.workers.map((item) => item.id === worker.id ? {
        ...item,
        status: nextStatus,
        targetZone: "lounge" as OfficeZoneType,
        targetPosition: { ...lounge },
        statusMinutes: nextStatus === item.status ? item.statusMinutes : 0,
        actionSummary: "少し休もう",
      } : item),
    };
  }

  const target = ZONE_POSITIONS[task.department];
  let next: CompanyState = {
    ...state,
    tasks: state.tasks.map((item) => item.id === task.id ? { ...item, status: "active", assignedWorkerId: worker.id } : item),
    workers: state.workers.map((item) => item.id === worker.id ? {
      ...item,
      currentTaskId: task.id,
      status: distance(item.position, target) < 1 ? (task.department === "meeting" ? "meeting" : "working") : "moving",
      targetZone: task.department,
      targetPosition: { ...target },
      statusMinutes: 0,
      actionSummary: actionSummary[task.type],
    } : item),
  };
  next = emitEvent(next, {
    type: "task_started",
    message: `${worker.name}が「${task.title}」を選択`,
    tone: "neutral",
    entityId: task.id,
  });
  return next;
}
