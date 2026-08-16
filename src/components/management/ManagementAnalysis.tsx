import { ArrowUpRight, CircleGauge, Lightbulb, Target } from "lucide-react";
import type { CompanyState } from "@/domain/company/types";
import { calculateBreakEven } from "@/domain/finance/break-even";
import { formatCurrency } from "@/lib/format";

export function ManagementAnalysis({ state }: { state: CompanyState }) {
  const breakEven = calculateBreakEven(state.businessPlan);
  const worker = state.workers[0];
  const capacityRate = worker.monthlyCapacityHours <= 0 ? 100 : worker.usedHours / worker.monthlyCapacityHours * 100;
  const acquisitionGap = breakEven.leads === null ? null : Math.max(0, breakEven.leads - state.businessPlan.product.monthlyLeads);
  return (
    <section className="panel analysis-panel">
      <div className="panel-heading"><div><span className="eyebrow">DETERMINISTIC METRICS + EXPLANATION</span><h2>AI Management Analysis</h2></div><Lightbulb size={18} /></div>
      <div className="analysis-layout">
        <div className="analysis-primary"><span>主要ボトルネック</span><strong>{acquisitionGap !== null && acquisitionGap > 0 ? "Customer Acquisition" : state.management.currentPriority === "service" ? "Service Delivery" : "No critical bottleneck"}</strong><p>{state.management.rationale}</p></div>
        <div className="analysis-metrics">
          <div><Target size={15} /><span>問い合わせ / 月</span><strong>{state.businessPlan.product.monthlyLeads}<em>件</em></strong></div>
          <div><ArrowUpRight size={15} /><span>既知費用ベース損益分岐</span><strong>{breakEven.contracts === null ? "—" : Math.ceil(breakEven.contracts)}<em>契約 / 月</em></strong></div>
          <div><CircleGauge size={15} /><span>Founder Capacity</span><strong>{capacityRate.toFixed(1)}<em>% used</em></strong></div>
        </div>
      </div>
      <div className="analysis-footer"><span className={state.finances.partialModel ? "model-badge partial" : "model-badge complete"}>{state.finances.partialModel ? "PARTIAL MODEL" : "KNOWN COST MODEL"}</span><p>Variable Cost: {state.businessPlan.product.variableCostPerContract === undefined ? "未設定。0円とは扱っていません。" : formatCurrency(state.businessPlan.product.variableCostPerContract)}</p></div>
    </section>
  );
}

