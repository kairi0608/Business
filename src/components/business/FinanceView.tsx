import { AlertTriangle, Banknote, Landmark, TrendingUp, WalletCards } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CompanyState } from "@/domain/company/types";
import { calculateBreakEven } from "@/domain/finance/break-even";
import { formatCurrency } from "@/lib/format";

export function FinanceView({ state }: { state: CompanyState }) {
  const breakEven = calculateBreakEven(state.businessPlan);
  const currentKnownCost = state.finances.currentMonthFixedCost + (state.finances.currentMonthVariableCost ?? 0);
  const chart = [...state.history.monthly.map((item) => ({ name: `M${item.month}`, cash: item.endingCash, revenue: item.revenue, profit: item.knownProfit })), { name: `M${state.clock.month} live`, cash: state.finances.cash, revenue: state.finances.currentMonthRevenue, profit: state.finances.currentMonthRevenue - currentKnownCost }];
  const cards = [
    { label: "Cash", value: state.finances.cash, icon: Banknote },
    { label: "Recognized Revenue", value: state.finances.recognizedRevenue, icon: TrendingUp },
    { label: "Known Costs", value: state.finances.knownCosts, icon: WalletCards },
    { label: "Known Profit", value: state.finances.knownProfit, icon: Landmark },
  ];
  return <main className="business-view"><div className="view-title"><div><span className="eyebrow">EVENT-DRIVEN LEDGER</span><h1>Finance</h1><p>売上はService Delivery完了Eventからのみ認識されます。</p></div><span className={`model-badge ${state.finances.partialModel ? "partial" : "complete"}`}>{state.finances.partialModel ? "PARTIAL MODEL" : "KNOWN COST MODEL"}</span></div>
    <div className="finance-kpis">{cards.map(({ label, value, icon: Icon }) => <section className="panel" key={label}><Icon size={17} /><span>{label}</span><strong className={value < 0 ? "negative" : ""}>{formatCurrency(value)}</strong></section>)}</div>
    <section className="panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">MONTHLY COMPANY STATE</span><h2>Cash / Revenue / Known Profit</h2></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ left: 8, right: 16, top: 10, bottom: 0 }}><defs><linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#33dfb6" stopOpacity={0.32}/><stop offset="100%" stopColor="#33dfb6" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#20324a" strokeDasharray="3 4" /><XAxis dataKey="name" stroke="#71839a" fontSize={11} /><YAxis stroke="#71839a" fontSize={11} tickFormatter={(value) => `¥${Math.round(value / 1000)}k`} /><Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: "#111d2b", border: "1px solid #2c405a", borderRadius: 8 }} /><Area type="monotone" dataKey="cash" stroke="#33dfb6" fill="url(#cashGradient)" strokeWidth={2} /><Area type="monotone" dataKey="revenue" stroke="#6b8cff" fill="transparent" strokeWidth={2} /><Area type="monotone" dataKey="profit" stroke="#f1b45b" fill="transparent" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></section>
    <div className="finance-detail-grid"><section className="panel break-even-card"><span className="eyebrow">KNOWN-COST BREAK-EVEN</span><strong>{breakEven.contracts === null ? "計算不可" : `${Math.ceil(breakEven.contracts)} 契約 / 月`}</strong><p>{breakEven.leads === null ? "Conversion条件を確認してください。" : `現在のConversionでは ${Math.ceil(breakEven.leads)} Leads / 月が必要です。`}</p></section><section className="panel partial-card"><AlertTriangle size={18} /><div><strong>{state.finances.partialModel ? "Variable Costが未設定" : "既知費用を計算中"}</strong><p>{state.finances.partialModel ? "Known Profitは既知費用のみを差し引いた値です。未設定を0円と断定していません。" : "固定費と変動費をCashへ反映しています。"}</p></div></section></div>
  </main>;
}
