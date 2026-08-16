import { CheckCircle2, CircleDashed, LockKeyhole } from "lucide-react";
import type { CompanyState } from "@/domain/company/types";
import { titleCase } from "@/lib/format";

export function TaskQueue({ state }: { state: CompanyState }) {
  const tasks = state.tasks.filter((task) => task.status !== "completed" && task.status !== "cancelled").sort((a, b) => b.priority - a.priority).slice(0, 7);
  return (
    <section className="panel task-panel">
      <div className="panel-heading"><div><span className="eyebrow">CAUSAL WORK QUEUE</span><h2>Business Tasks</h2></div></div>
      <div className="task-list">{tasks.length === 0 ? <p className="empty-state">新しいBusiness Eventを待っています。</p> : tasks.map((task) => {
        const progress = Math.min(100, (task.progressHours / Math.max(task.requiredHours, 0.001)) * 100);
        return <div className="task-row" key={task.id}>
          {task.status === "blocked" ? <LockKeyhole size={14} /> : task.status === "active" ? <CircleDashed size={14} /> : <CheckCircle2 size={14} />}
          <div><strong>{task.title}</strong><span>{titleCase(task.department)} · {task.requiredHours.toFixed(1)}h · P{task.priority}</span><i><b style={{ width: `${progress}%` }} /></i></div>
          <em>{task.status}</em>
        </div>;
      })}</div>
    </section>
  );
}
