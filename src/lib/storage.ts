import { createInitialCompanyState } from "@/domain/company/defaults";
import type { CompanyState } from "@/domain/company/types";

export const STORAGE_KEY = "ai-business-simulator:company:v1";

export function isCompanyState(value: unknown): value is CompanyState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CompanyState>;
  return candidate.schemaVersion === 1
    && typeof candidate.seed === "number"
    && !!candidate.clock
    && !!candidate.finances
    && !!candidate.businessPlan
    && Array.isArray(candidate.workers)
    && Array.isArray(candidate.tasks)
    && Array.isArray(candidate.events)
    && candidate.workers.length >= 1;
}

export function readStoredCompany(raw: string | null): CompanyState {
  if (!raw) return createInitialCompanyState();
  try {
    const parsed: unknown = JSON.parse(raw);
    return isCompanyState(parsed) ? parsed : createInitialCompanyState();
  } catch {
    return createInitialCompanyState();
  }
}

export function loadCompanyState(): CompanyState {
  if (typeof window === "undefined") return createInitialCompanyState();
  return readStoredCompany(window.localStorage.getItem(STORAGE_KEY));
}

export function saveCompanyState(state: CompanyState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The simulation continues in memory when storage is unavailable.
  }
}

export function clearStoredCompany(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

