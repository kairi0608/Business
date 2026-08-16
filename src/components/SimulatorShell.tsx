"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Boxes, Building2, GitCompareArrows, Map, PackageOpen, Route, WalletCards } from "lucide-react";
import type { BusinessPlan } from "@/domain/company/types";
import { useCompanyStore } from "@/store/company-store";
import { KpiHeader } from "./shared/KpiHeader";
import { SimulationControls } from "./office/SimulationControls";
import { OfficeView } from "./office/OfficeView";
import { PlanView } from "./business/PlanView";
import { FinanceView } from "./business/FinanceView";
import { ProductsView } from "./business/ProductsView";
import { ResourcesView } from "./business/ResourcesView";
import { CompareView } from "./business/CompareView";
import { RoadmapView } from "./business/RoadmapView";

type ViewId = "office" | "plan" | "finance" | "products" | "resources" | "compare" | "roadmap";

const navigation: Array<{ id: ViewId; label: string; icon: typeof Building2 }> = [
  { id: "office", label: "OFFICE", icon: Building2 },
  { id: "plan", label: "PLAN", icon: Map },
  { id: "finance", label: "FINANCE", icon: BarChart3 },
  { id: "products", label: "PRODUCTS", icon: PackageOpen },
  { id: "resources", label: "RESOURCES", icon: WalletCards },
  { id: "compare", label: "COMPARE", icon: GitCompareArrows },
  { id: "roadmap", label: "ROADMAP", icon: Route },
];

export function SimulatorShell() {
  const company = useCompanyStore((store) => store.company);
  const hydrated = useCompanyStore((store) => store.hydrated);
  const hydrate = useCompanyStore((store) => store.hydrate);
  const tick = useCompanyStore((store) => store.tick);
  const setSpeed = useCompanyStore((store) => store.setSpeed);
  const setStrategy = useCompanyStore((store) => store.setStrategy);
  const setScenario = useCompanyStore((store) => store.setScenario);
  const updateBusinessPlan = useCompanyStore((store) => store.updateBusinessPlan);
  const addDevelopmentTask = useCompanyStore((store) => store.addDevelopmentTask);
  const resetCompany = useCompanyStore((store) => store.resetCompany);
  const [view, setView] = useState<ViewId>("office");
  const [selectedWorkerId, setSelectedWorkerId] = useState("worker-founder");
  const lastTick = useRef<number>(0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (!hydrated || company.clock.speed === 0) return;
    lastTick.current = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTick.current) / 1000;
      lastTick.current = now;
      tick(delta);
    }, 250);
    return () => window.clearInterval(timer);
  }, [hydrated, company.clock.speed, tick]);

  const reset = () => {
    if (window.confirm("保存済みの会社状態と履歴を初期化しますか？")) {
      resetCompany();
      setView("office");
    }
  };

  const content: Record<ViewId, React.ReactNode> = {
    office: <OfficeView state={company} selectedWorkerId={selectedWorkerId} onSelectWorker={setSelectedWorkerId} onStrategy={setStrategy} onScenario={setScenario} />,
    plan: <PlanView state={company} onUpdate={(plan: BusinessPlan) => updateBusinessPlan(plan)} />,
    finance: <FinanceView state={company} />,
    products: <ProductsView state={company} onAddTask={addDevelopmentTask} />,
    resources: <ResourcesView state={company} />,
    compare: <CompareView state={company} />,
    roadmap: <RoadmapView />,
  };

  return (
    <div className="app-shell">
      <KpiHeader state={company} />
      <div className="control-strip"><SimulationControls speed={company.clock.speed} onSpeed={setSpeed} onReset={reset} /><div className="simulation-truth"><Boxes size={13} /><span>Avatar / Task / Finance share one CompanyState</span></div></div>
      <div className="app-content">{content[view]}</div>
      <nav className="bottom-nav">{navigation.map(({ id, label, icon: Icon }) => <button className={view === id ? "active" : ""} key={id} onClick={() => setView(id)}><Icon size={16} /><span>{label}</span></button>)}</nav>
    </div>
  );
}
