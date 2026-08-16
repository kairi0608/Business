import { Banknote, Clock4, UserRound } from "lucide-react";
import type { CompanyState } from "@/domain/company/types";
import { formatCurrency } from "@/lib/format";

export function ResourcesView({ state }: { state: CompanyState }) {
  const worker = state.workers[0];
  const remaining = Math.max(0, worker.monthlyCapacityHours - worker.usedHours);
  const rate = worker.monthlyCapacityHours <= 0 ? 100 : Math.min(100, worker.usedHours / worker.monthlyCapacityHours * 100);
  return <main className="business-view"><div className="view-title"><div><span className="eyebrow">FINITE OPERATING INPUTS</span><h1>Resources</h1><p>Money / Time / Peopleを会社状態の実値で追跡します。</p></div></div>
    <div className="resource-grid"><section className="panel resource-card"><Banknote size={22} /><span>MONEY</span><strong>{formatCurrency(state.finances.cash)}</strong><p>Starting Cash {formatCurrency(state.businessPlan.startingCash)}</p><i><b style={{ width: `${Math.min(100, state.finances.cash / Math.max(1, state.businessPlan.startingCash) * 100)}%` }} /></i></section><section className="panel resource-card"><Clock4 size={22} /><span>FOUNDER TIME</span><strong>{remaining.toFixed(1)}h</strong><p>{worker.usedHours.toFixed(1)}h used / {worker.monthlyCapacityHours}h</p><i><b style={{ width: `${rate}%` }} /></i></section><section className="panel resource-card"><UserRound size={22} /><span>PEOPLE</span><strong>{state.workers.length}</strong><p>Founder Agentのみで開始</p><i><b style={{ width: "12%" }} /></i></section></div>
    <section className="panel capacity-table"><div className="panel-heading"><div><span className="eyebrow">ACTUAL WORK DISTRIBUTION</span><h2>Founder Time</h2></div></div><div>{Object.entries(worker.todayHours).map(([department, hours]) => <span key={department}><strong>{department.toUpperCase()}</strong><i><b style={{ width: `${Math.min(100, hours / 5 * 100)}%` }} /></i><em>{hours.toFixed(1)}h today</em></span>)}</div></section>
    <section className="panel hiring-note"><span>FUTURE ARCHITECTURE</span><strong>Capacity不足を観測してから採用へ</strong><p>PrototypeではFounder 1名のみ。Worker配列とRole/Skill構造は、Sales・Service・Product・Admin社員を後から追加可能です。</p></section>
  </main>;
}

