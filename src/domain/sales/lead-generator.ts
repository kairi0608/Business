import type { CompanyState, Lead } from "@/domain/company/types";
import { WORK_DAYS_PER_MONTH, WORKDAY_START } from "@/domain/company/defaults";
import { emitEvent } from "@/domain/events/event-engine";
import { applyScenario } from "@/domain/scenarios/apply-scenario";
import { appendTask } from "@/domain/tasks/task-generator";

export function deterministicSample(seed: number, month: number, sequence: number): number {
  const base = ((seed % 997) + 997) % 997 / 997;
  return (base + (sequence - 1) * 0.61803398875 + (month - 1) * 0.41421356237) % 1;
}

function leadCount(state: CompanyState): number {
  const planned = applyScenario(state.businessPlan, state.scenario).product.monthlyLeads;
  const whole = Math.floor(Math.max(0, planned));
  const fraction = Math.max(0, planned) - whole;
  const sample = deterministicSample(state.seed + 31, state.clock.month, 1);
  return whole + (sample < fraction ? 1 : 0);
}

export function scheduledLeadDay(index: number, count: number): number {
  if (count === 2) return index === 0 ? 4 : 18;
  return Math.max(1, Math.min(WORK_DAYS_PER_MONTH, Math.round(((index + 1) * (WORK_DAYS_PER_MONTH + 1)) / (count + 1))));
}

export function generateDueLeads(state: CompanyState): CompanyState {
  if (state.clock.minuteOfDay !== WORKDAY_START) return state;
  const count = leadCount(state);
  let next = state;
  for (let index = 0; index < count; index += 1) {
    const key = `lead:${state.clock.month}:${index}`;
    if (scheduledLeadDay(index, count) !== state.clock.day || next.generatedExternalEventKeys.includes(key)) continue;
    const sequence = next.leads.length + 1;
    const lead: Lead = {
      id: `lead-${next.nextEntityId}`,
      sequence,
      month: next.clock.month,
      status: "new",
      marketSample: deterministicSample(next.seed, next.clock.month, sequence),
      createdAt: next.clock.elapsedWorkMinutes,
    };
    next = {
      ...next,
      nextEntityId: next.nextEntityId + 1,
      leads: [...next.leads, lead],
      generatedExternalEventKeys: [...next.generatedExternalEventKeys, key],
    };
    next = appendTask(next, {
      type: "lead_contact",
      title: `問い合わせ #${String(sequence).padStart(3, "0")} の初回確認`,
      department: "sales",
      priority: 8,
      requiredHours: 0.5,
      relatedLeadId: lead.id,
    });
    next = emitEvent(next, {
      type: "lead_arrived",
      message: `問い合わせ #${String(sequence).padStart(3, "0")} が到着し、営業Taskを生成`,
      tone: "neutral",
      entityId: lead.id,
    });
  }
  return next;
}

