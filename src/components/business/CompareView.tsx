import { Check, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { BusinessPlan, CompanyState, ScenarioId } from "@/domain/company/types";
import { applyScenario } from "@/domain/scenarios/apply-scenario";
import { formatCurrency, titleCase } from "@/lib/format";

function planningResult(plan: BusinessPlan, scenario: ScenarioId) {
  const effective = applyScenario(plan, scenario);
  const demand = effective.product.monthlyLeads * effective.product.conversionRate;
  const capacityContracts = effective.product.hoursPerContract <= 0 ? demand : effective.founderMonthlyCapacityHours / effective.product.hoursPerContract;
  const contracts = Math.min(demand, capacityContracts);
  const revenue = contracts * effective.product.price;
  const variable = effective.product.variableCostPerContract === undefined ? undefined : contracts * effective.product.variableCostPerContract;
  return { leads: effective.product.monthlyLeads, contracts, revenue, knownProfit: revenue - effective.monthlyFixedCost - (variable ?? 0), partial: variable === undefined };
}

export function CompareView({ state }: { state: CompanyState }) {
  const scenarios: ScenarioId[] = ["conservative", "base", "optimistic"];
  return <main className="business-view"><div className="view-title"><div><span className="eyebrow">ENVIRONMENT COMPARISON</span><h1>Compare</h1><p>Scenarioは市場環境であり、AI CEOの意思決定とは別レイヤーです。</p></div></div>
    <div className="compare-grid">{scenarios.map((scenario) => { const result = planningResult(state.businessPlan, scenario); const Icon = scenario === "conservative" ? TrendingDown : scenario === "optimistic" ? TrendingUp : Minus; return <section className={`panel compare-card ${state.scenario === scenario ? "active" : ""}`} key={scenario}><div className="compare-head"><Icon size={19} /><div><span>SCENARIO</span><h2>{titleCase(scenario)}</h2></div>{state.scenario === scenario && <em><Check size={12} /> ACTIVE</em>}</div><dl><div><dt>Leads</dt><dd>{result.leads.toFixed(1)}</dd></div><div><dt>Expected Contracts</dt><dd>{result.contracts.toFixed(2)}</dd></div><div><dt>Planning Revenue</dt><dd>{formatCurrency(result.revenue)}</dd></div><div><dt>Known Profit</dt><dd className={result.knownProfit < 0 ? "negative" : ""}>{formatCurrency(result.knownProfit)}</dd></div></dl>{result.partial && <span className="model-badge partial">PARTIAL MODEL</span>}</section>; })}</div>
    <section className="panel compare-note"><strong>Planning output ≠ Actual simulation result</strong><p>ここでの期待値は計画比較用です。Officeの実績売上は、Lead工程・成約解決・Founder Capacity・Service Delivery完了を通過した結果だけです。</p></section>
  </main>;
}

