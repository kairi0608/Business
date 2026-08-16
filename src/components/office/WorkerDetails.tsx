import { Gauge, ListTodo, MapPin, UserRound } from "lucide-react";
import type { CompanyState, WorkerAgent } from "@/domain/company/types";
import { titleCase } from "@/lib/format";

export function WorkerDetails({ worker, state }: { worker: WorkerAgent; state: CompanyState }) {
  const task = state.tasks.find((item) => item.id === worker.currentTaskId);
  const queue = state.tasks.filter((item) => item.status === "queued" || item.status === "active" || item.status === "blocked").length;
  const progress = task ? Math.min(100, (task.progressHours / Math.max(task.requiredHours, 0.001)) * 100) : 0;
  return (
    <section className="panel worker-detail-panel">
      <div className="worker-detail-head"><span className="detail-avatar"><UserRound size={20} /></span><div><span className="eyebrow">SELECTED AGENT</span><h2>{worker.name}</h2><small>{titleCase(worker.role)} · {worker.status.toUpperCase()}</small></div></div>
      <div className="detail-block">
        <span><MapPin size={13} /> CURRENT TASK</span>
        <strong>{task?.title ?? "待機中"}</strong>
        {task && <><div className="detail-progress"><i style={{ width: `${progress}%` }} /></div><em>{Math.round(progress)}% · {task.progressHours.toFixed(1)} / {task.requiredHours.toFixed(1)}h</em></>}
      </div>
      <div className="detail-grid">
        <div><span><ListTodo size={12} /> QUEUE</span><strong>{queue}</strong><em>Tasks</em></div>
        <div><span><Gauge size={12} /> CAPACITY</span><strong>{worker.usedHours.toFixed(1)}h</strong><em>/ {worker.monthlyCapacityHours}h</em></div>
      </div>
      <div className="today-hours"><span className="eyebrow">TODAY</span>{Object.entries(worker.todayHours).map(([department, hours]) => <div key={department}><span>{titleCase(department)}</span><i><b style={{ width: `${Math.min(100, hours / 4 * 100)}%` }} /></i><strong>{hours.toFixed(1)}h</strong></div>)}</div>
    </section>
  );
}
