import { ArrowRight, CheckCircle2, Circle, Lock } from "lucide-react";

const units = ["Education", "Startup Support", "Management Consulting", "AI SaaS", "Real Estate", "Business Brokerage", "Co-creation Platform"];

export function RoadmapView() {
  return <main className="business-view"><div className="view-title"><div><span className="eyebrow">EXTENSIBLE COMPANY MODEL</span><h1>Roadmap</h1><p>現在の教育事業を壊さず、Business UnitとWorkerを増やせる構造です。</p></div></div>
    <section className="panel roadmap-flow">{units.map((unit, index) => <div key={unit} className={index === 0 ? "active" : "locked"}><span>{index === 0 ? <CheckCircle2 size={18} /> : <Lock size={15} />}</span><div><small>PHASE {index + 1}</small><strong>{unit}</strong><em>{index === 0 ? "SIMULATING" : "FUTURE"}</em></div>{index < units.length - 1 && <ArrowRight size={16} />}</div>)}</section>
    <div className="roadmap-columns"><section className="panel"><span className="eyebrow">WORKFORCE</span>{["Founder", "Sales Employee", "Service Employee", "Product Engineer", "Admin"].map((role, index) => <p key={role}>{index === 0 ? <CheckCircle2 size={14} /> : <Circle size={14} />}<strong>{role}</strong><em>{index === 0 ? "ACTIVE" : "PLANNED"}</em></p>)}</section><section className="panel"><span className="eyebrow">ARCHITECTURE READY</span><ul><li>Role / Skill based task selection</li><li>Zone registry for new departments</li><li>Plan vs Actual history</li><li>Hiring decision boundary</li><li>Goal Seek observation</li></ul></section></div>
  </main>;
}
