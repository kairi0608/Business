import { BrainCircuit, ChevronRight, ShieldCheck } from "lucide-react";
import type { CompanyState, ManagementStrategy, ScenarioId } from "@/domain/company/types";
import { titleCase } from "@/lib/format";

const strategies: ManagementStrategy[] = ["balanced", "cash_preservation", "profit_first", "growth_first", "learning_first"];
const scenarios: ScenarioId[] = ["conservative", "base", "optimistic"];

export function ManagementControl({ state, onStrategy, onScenario }: { state: CompanyState; onStrategy: (strategy: ManagementStrategy) => void; onScenario: (scenario: ScenarioId) => void }) {
  return (
    <section className="panel management-panel">
      <div className="panel-heading"><div><span className="eyebrow">POLICY LAYER</span><h2>Management Control</h2></div><BrainCircuit size={18} /></div>
      <div className="management-section"><label>AI CEO STRATEGY</label><div className="strategy-list">{strategies.map((strategy) => <button className={state.management.strategy === strategy ? "active" : ""} key={strategy} onClick={() => onStrategy(strategy)}><span>{titleCase(strategy)}</span><ChevronRight size={13} /></button>)}</div></div>
      <div className="priority-card"><span>CURRENT PRIORITY</span><strong>{titleCase(state.management.currentPriority)}</strong><p>{state.management.rationale}</p></div>
      <div className="scenario-control"><div><ShieldCheck size={14} /><span><strong>MARKET SCENARIO</strong><small>AI CEOから独立</small></span></div><select value={state.scenario} onChange={(event) => onScenario(event.target.value as ScenarioId)}>{scenarios.map((scenario) => <option key={scenario} value={scenario}>{titleCase(scenario)}</option>)}</select></div>
    </section>
  );
}

