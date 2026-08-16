import { Banknote, BriefcaseBusiness, Building2, Clock3, Layers3, Users } from "lucide-react";
import type { CompanyState } from "@/domain/company/types";
import { selectBacklog } from "@/domain/company/selectors";
import { formatClock, formatCurrency } from "@/lib/format";

export function KpiHeader({ state }: { state: CompanyState }) {
  const backlog = selectBacklog(state);
  const metrics = [
    { label: "COMPANY", value: state.businessPlan.businessName, icon: Building2 },
    { label: "CASH", value: formatCurrency(state.finances.cash), icon: Banknote },
    { label: "REVENUE", value: formatCurrency(state.finances.recognizedRevenue), icon: BriefcaseBusiness },
    { label: "KNOWN PROFIT", value: formatCurrency(state.finances.knownProfit), icon: Layers3, negative: state.finances.knownProfit < 0 },
    { label: "BACKLOG", value: String(backlog.total), icon: Clock3 },
    { label: "STAFF", value: String(state.workers.length), icon: Users },
  ];
  return (
    <header className="kpi-header">
      <div className="brand-block"><span className="brand-mark">AB</span><div><strong>AI BUSINESS</strong><small>OPERATING SYSTEM</small></div></div>
      <div className="kpi-list">
        {metrics.map(({ label, value, icon: Icon, negative }) => (
          <div className="kpi-item" key={label}><Icon size={14} /><div><span>{label}</span><strong className={negative ? "negative" : ""}>{value}</strong></div></div>
        ))}
      </div>
      <div className="clock-chip"><span className="live-pulse" /><div><strong>M{state.clock.month} · D{state.clock.day}</strong><span>{formatClock(state.clock.minuteOfDay)}</span></div></div>
    </header>
  );
}

