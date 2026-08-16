import type { BusinessEvent, BusinessEventType, CompanyState } from "@/domain/company/types";

export function emitEvent(
  state: CompanyState,
  event: Pick<BusinessEvent, "message" | "tone"> & Partial<Pick<BusinessEvent, "entityId" | "amount">> & { type: BusinessEventType },
): CompanyState {
  const item: BusinessEvent = {
    id: `event-${state.nextEntityId}`,
    type: event.type,
    message: event.message,
    tone: event.tone,
    month: state.clock.month,
    day: state.clock.day,
    minuteOfDay: state.clock.minuteOfDay,
    elapsedWorkMinutes: state.clock.elapsedWorkMinutes,
    entityId: event.entityId,
    amount: event.amount,
  };
  return { ...state, nextEntityId: state.nextEntityId + 1, events: [item, ...state.events].slice(0, 240) };
}

