import { SIMULATION_QUANTUM_MINUTES } from "@/domain/company/defaults";
import type { CompanyState } from "@/domain/company/types";
import { generateStrategyTasks } from "@/domain/management/management-tasks";
import { generateDueLeads } from "@/domain/sales/lead-generator";
import { evaluateWorker } from "@/domain/workforce/worker-ai";
import { moveWorkers, progressWorkerTask } from "@/domain/workforce/worker-actions";
import { advanceClockAndReviews } from "./day";

export function simulationTick(source: CompanyState): CompanyState {
  let state = generateDueLeads(source);
  state = generateStrategyTasks(state);
  for (const worker of state.workers) state = evaluateWorker(state, worker.id);
  state = moveWorkers(state);
  for (const worker of state.workers) state = progressWorkerTask(state, worker.id);
  return advanceClockAndReviews(state, SIMULATION_QUANTUM_MINUTES);
}

