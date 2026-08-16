import type { ReactNode } from "react";
import type { OfficeZoneType } from "@/domain/company/types";

export function OfficeZone({ id, title, subtitle, backlog, children }: { id: OfficeZoneType; title: string; subtitle: string; backlog?: number; children: ReactNode }) {
  return (
    <div className={`office-zone zone-${id}`}>
      <div className="zone-label"><div><strong>{title}</strong><span>{subtitle}</span></div>{backlog !== undefined && <em>{backlog} OPEN</em>}</div>
      <div className="zone-props">{children}</div>
    </div>
  );
}

