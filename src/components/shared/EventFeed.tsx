import { Activity, ArrowDownRight, CheckCircle2, CircleAlert } from "lucide-react";
import type { BusinessEvent } from "@/domain/company/types";
import { formatClock } from "@/lib/format";

function EventIcon({ tone }: { tone: BusinessEvent["tone"] }) {
  if (tone === "success") return <CheckCircle2 size={14} />;
  if (tone === "warning") return <CircleAlert size={14} />;
  if (tone === "finance") return <ArrowDownRight size={14} />;
  return <Activity size={14} />;
}

export function EventFeed({ events, limit = 12 }: { events: BusinessEvent[]; limit?: number }) {
  return (
    <section className="panel event-panel">
      <div className="panel-heading"><div><span className="eyebrow">STATE-BOUND LOG</span><h2>Event Feed</h2></div><span className="feed-count">{events.length} events</span></div>
      <div className="event-list">
        {events.slice(0, limit).map((event) => (
          <div className={`event-row tone-${event.tone}`} key={event.id}>
            <div className="event-icon"><EventIcon tone={event.tone} /></div>
            <time>M{event.month} D{event.day}<strong>{formatClock(event.minuteOfDay)}</strong></time>
            <p>{event.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

