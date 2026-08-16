import { selectBacklog } from "@/domain/company/selectors";
import type { CompanyState, ManagementStrategy, ScenarioId } from "@/domain/company/types";
import { EventFeed } from "@/components/shared/EventFeed";
import { ManagementAnalysis } from "@/components/management/ManagementAnalysis";
import { ManagementControl } from "@/components/management/ManagementControl";
import { OfficeMap } from "./OfficeMap";
import { TaskQueue } from "./TaskQueue";
import { WorkerDetails } from "./WorkerDetails";

export function OfficeView({ state, selectedWorkerId, onSelectWorker, onStrategy, onScenario }: {
  state: CompanyState;
  selectedWorkerId: string;
  onSelectWorker: (id: string) => void;
  onStrategy: (strategy: ManagementStrategy) => void;
  onScenario: (scenario: ScenarioId) => void;
}) {
  const worker = state.workers.find((item) => item.id === selectedWorkerId) ?? state.workers[0];
  const backlog = selectBacklog(state);
  return (
    <main className="office-view">
      <div className="office-primary"><OfficeMap state={state} selectedWorkerId={worker?.id} onSelect={onSelectWorker} /><ManagementControl state={state} onStrategy={onStrategy} onScenario={onScenario} /></div>
      <div className="office-secondary"><WorkerDetails worker={worker} state={state} /><TaskQueue state={state} /><div className="backlog-panel panel"><span className="eyebrow">LIVE BACKLOG</span><h2>{backlog.total}<small>OPEN TASKS</small></h2>{Object.entries(backlog.byDepartment).map(([name, count]) => <div key={name}><span>{name.toUpperCase()}</span><i><b style={{ width: `${backlog.total ? (count / backlog.total) * 100 : 0}%` }} /></i><strong>{count}</strong></div>)}</div></div>
      <ManagementAnalysis state={state} />
      <EventFeed events={state.events} />
    </main>
  );
}
