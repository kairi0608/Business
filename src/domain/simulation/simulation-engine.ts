import { SIMULATION_MINUTES_PER_REAL_SECOND, SIMULATION_QUANTUM_MINUTES } from "@/domain/company/defaults";
import type { CompanyState } from "@/domain/company/types";
import { simulationTick } from "./tick";

export function advanceVirtualMinutes(source: CompanyState, virtualMinutes: number): CompanyState {
  const safeMinutes = Number.isFinite(virtualMinutes) ? Math.max(0, virtualMinutes) : 0;
  const total = source.clock.tickRemainderMinutes + safeMinutes;
  const ticks = Math.floor(total / SIMULATION_QUANTUM_MINUTES);
  let state = source;
  for (let index = 0; index < ticks; index += 1) state = simulationTick(state);
  return {
    ...state,
    clock: { ...state.clock, tickRemainderMinutes: total - ticks * SIMULATION_QUANTUM_MINUTES },
  };
}

export function stepSimulation(source: CompanyState, realDeltaSeconds: number): CompanyState {
  if (source.clock.speed === 0) return source;
  const safeDelta = Number.isFinite(realDeltaSeconds) ? Math.max(0, Math.min(2, realDeltaSeconds)) : 0;
  return advanceVirtualMinutes(source, safeDelta * SIMULATION_MINUTES_PER_REAL_SECOND * source.clock.speed);
}

