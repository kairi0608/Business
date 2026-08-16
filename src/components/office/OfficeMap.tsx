import { BookOpenCheck, Coffee, FileSpreadsheet, MonitorCog, Presentation, Radio, Send } from "lucide-react";
import type { CompanyState } from "@/domain/company/types";
import { selectBacklog } from "@/domain/company/selectors";
import { OfficeZone } from "./OfficeZone";
import { WorkerAvatar } from "./WorkerAvatar";

function Desk({ icon: Icon }: { icon: typeof Send }) {
  return <span className="office-desk"><Icon size={17} /><i /></span>;
}

export function OfficeMap({ state, selectedWorkerId, onSelect }: { state: CompanyState; selectedWorkerId?: string; onSelect: (id: string) => void }) {
  const backlog = selectBacklog(state);
  const working = state.workers.filter((worker) => worker.status === "working" || worker.status === "meeting").length;
  return (
    <section className="office-card panel">
      <div className="office-card-heading">
        <div><span className="eyebrow"><i className="live-pulse" /> AGENT SIMULATION</span><h1>Live Office</h1></div>
        <div className="office-status"><strong>{working}</strong> working <span /> <strong>{state.workers.length - working}</strong> available</div>
      </div>
      <div className="office-floor">
        <div className="floor-grid" />
        <OfficeZone id="sales" title="SALES" subtitle="問い合わせ・提案" backlog={backlog.byDepartment.sales}><Desk icon={Send} /><span className="radio-prop"><Radio size={14} /></span></OfficeZone>
        <OfficeZone id="service" title="SERVICE / EDUCATION" subtitle="教育サービス提供" backlog={backlog.byDepartment.service}><Desk icon={BookOpenCheck} /><span className="board-prop" /></OfficeZone>
        <OfficeZone id="product" title="PRODUCT / AI" subtitle="教材・AI開発" backlog={backlog.byDepartment.product}><Desk icon={MonitorCog} /><span className="server-prop" /></OfficeZone>
        <OfficeZone id="admin" title="ADMIN" subtitle="請求・会計" backlog={backlog.byDepartment.admin}><Desk icon={FileSpreadsheet} /><span className="cabinet-prop" /></OfficeZone>
        <OfficeZone id="meeting" title="MEETING HUB" subtitle="経営レビュー" backlog={backlog.byDepartment.meeting}><span className="meeting-prop"><Presentation size={19} /></span></OfficeZone>
        <OfficeZone id="lounge" title="LOUNGE" subtitle="休憩"><span className="lounge-prop"><Coffee size={18} /></span></OfficeZone>
        {state.workers.map((worker) => <WorkerAvatar key={worker.id} worker={worker} task={state.tasks.find((task) => task.id === worker.currentTaskId)} selected={worker.id === selectedWorkerId} onSelect={() => onSelect(worker.id)} />)}
      </div>
    </section>
  );
}

