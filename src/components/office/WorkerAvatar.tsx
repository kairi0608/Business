import type { BusinessTask, WorkerAgent } from "@/domain/company/types";

export function WorkerAvatar({ worker, task, selected, onSelect }: { worker: WorkerAgent; task?: BusinessTask; selected: boolean; onSelect: () => void }) {
  const progress = task ? Math.min(100, (task.progressHours / Math.max(task.requiredHours, 0.001)) * 100) : 0;
  return (
    <button
      className={`worker-avatar ${selected ? "selected" : ""} status-${worker.status}`}
      style={{ left: `${worker.position.x}%`, top: `${worker.position.y}%` }}
      onClick={onSelect}
      aria-label={`${worker.name}: ${worker.status}`}
    >
      <span className="worker-bubble">{worker.actionSummary}</span>
      <span className="worker-shadow" />
      <span className="person">
        <i className="person-hair" /><i className="person-head" /><i className="person-body" /><i className="person-arm left" /><i className="person-arm right" /><i className="person-leg left" /><i className="person-leg right" />
      </span>
      <span className="worker-name"><strong>{worker.name}</strong><em>{worker.status.toUpperCase()}</em></span>
      {task && <span className="worker-progress"><i style={{ width: `${progress}%` }} /></span>}
    </button>
  );
}

