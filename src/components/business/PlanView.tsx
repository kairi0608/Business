import { CircleHelp, Save } from "lucide-react";
import type { BusinessPlan, CompanyState } from "@/domain/company/types";
import { AssumptionBadge } from "./AssumptionBadge";

function Field({ label, source, value, suffix, step = 1, allowUnknown, onChange }: { label: string; source: "user"; value?: number; suffix: string; step?: number; allowUnknown?: boolean; onChange: (value: number | undefined) => void }) {
  return <label className="plan-field"><span>{label}<AssumptionBadge source={source} /></span><div><input type="number" min="0" step={step} value={value ?? ""} placeholder={allowUnknown ? "未設定" : "0"} onChange={(event) => onChange(event.target.value === "" && allowUnknown ? undefined : Math.max(0, Number(event.target.value)))} /><em>{suffix}</em></div>{allowUnknown && <small><CircleHelp size={12} /> 空欄は0ではなく「不明」として保持</small>}</label>;
}

export function PlanView({ state, onUpdate }: { state: CompanyState; onUpdate: (plan: BusinessPlan) => void }) {
  const plan = state.businessPlan;
  const update = (patch: Partial<BusinessPlan>) => onUpdate({ ...plan, ...patch });
  const updateProduct = (patch: Partial<BusinessPlan["product"]>) => onUpdate({ ...plan, product: { ...plan.product, ...patch } });
  return <main className="business-view">
    <div className="view-title"><div><span className="eyebrow">BUSINESS CONFIG</span><h1>Plan</h1><p>市場仮定と経営判断を分離した、Simulationの入力条件です。</p></div><span className="saved-indicator"><Save size={14} /> LOCAL AUTO SAVE</span></div>
    <section className="panel plan-section"><div className="section-title"><span>01</span><div><h2>Company Foundation</h2><p>会社の初期条件と許容リスク</p></div></div><div className="plan-grid">
      <label className="plan-field wide"><span>Business Name<AssumptionBadge source="user" /></span><div><input value={plan.businessName} onChange={(event) => update({ businessName: event.target.value })} /></div></label>
      <Field label="Starting Cash" source="user" value={plan.startingCash} suffix="JPY" onChange={(value) => update({ startingCash: value ?? 0 })} />
      <Field label="Monthly Loss Tolerance" source="user" value={plan.monthlyLossTolerance} suffix="JPY" onChange={(value) => update({ monthlyLossTolerance: value ?? 0 })} />
      <Field label="Founder Monthly Capacity" source="user" value={plan.founderMonthlyCapacityHours} suffix="HOURS" onChange={(value) => update({ founderMonthlyCapacityHours: value ?? 0 })} />
      <Field label="Monthly Fixed Cost" source="user" value={plan.monthlyFixedCost} suffix="JPY" onChange={(value) => update({ monthlyFixedCost: value ?? 0 })} />
    </div></section>
    <section className="panel plan-section"><div className="section-title"><span>02</span><div><h2>Product & Funnel</h2><p>Lead → Contract → Deliveryの事業条件</p></div></div><div className="plan-grid">
      <label className="plan-field wide"><span>Product Name<AssumptionBadge source="user" /></span><div><input value={plan.product.name} onChange={(event) => updateProduct({ name: event.target.value })} /></div></label>
      <Field label="Price" source="user" value={plan.product.price} suffix="JPY" onChange={(value) => updateProduct({ price: value ?? 0 })} />
      <Field label="Monthly Leads" source="user" value={plan.product.monthlyLeads} suffix="LEADS" step={0.1} onChange={(value) => updateProduct({ monthlyLeads: value ?? 0 })} />
      <Field label="Conversion Rate" source="user" value={plan.product.conversionRate * 100} suffix="%" step={1} onChange={(value) => updateProduct({ conversionRate: Math.min(1, (value ?? 0) / 100) })} />
      <Field label="Delivery per Contract" source="user" value={plan.product.hoursPerContract} suffix="HOURS" step={0.25} onChange={(value) => updateProduct({ hoursPerContract: value ?? 0 })} />
      <Field label="Variable Cost per Contract" source="user" value={plan.product.variableCostPerContract} suffix="JPY" allowUnknown onChange={(value) => updateProduct({ variableCostPerContract: value })} />
    </div></section>
  </main>;
}

