import type { AssumptionSource } from "@/domain/company/types";

export function AssumptionBadge({ source }: { source: AssumptionSource }) {
  const labels: Record<AssumptionSource, string> = { user: "USER INPUT", ai_assumption: "AI ASSUMPTION", actual: "ACTUAL", external: "EXTERNAL" };
  return <span className={`source-badge source-${source}`}>{labels[source]}</span>;
}

