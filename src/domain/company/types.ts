export type AssumptionSource = "user" | "ai_assumption" | "actual" | "external";
export type ScenarioId = "conservative" | "base" | "optimistic";
export type SimulationSpeed = 0 | 1 | 2 | 4;

export type OfficeZoneType = "sales" | "service" | "product" | "admin" | "meeting" | "lounge";
export type WorkDepartment = Exclude<OfficeZoneType, "lounge">;
export type ManagementPriority = WorkDepartment | "balanced";
export type ManagementStrategy = "balanced" | "cash_preservation" | "profit_first" | "growth_first" | "learning_first";

export type BusinessTaskType =
  | "lead_contact"
  | "sales_followup"
  | "proposal"
  | "contract_processing"
  | "service_preparation"
  | "service_delivery"
  | "customer_followup"
  | "product_development"
  | "ai_development"
  | "billing"
  | "accounting"
  | "management_review";

export interface Position {
  x: number;
  y: number;
}

export interface ProductConfig {
  id: string;
  name: string;
  price: number;
  monthlyLeads: number;
  conversionRate: number;
  hoursPerContract: number;
  variableCostPerContract?: number;
}

export interface BusinessPlan {
  businessName: string;
  startingCash: number;
  monthlyLossTolerance: number;
  founderMonthlyCapacityHours: number;
  monthlyFixedCost: number;
  product: ProductConfig;
  sources: Record<string, AssumptionSource>;
}

export interface SimulationClockState {
  month: number;
  day: number;
  minuteOfDay: number;
  elapsedWorkMinutes: number;
  speed: SimulationSpeed;
  tickRemainderMinutes: number;
}

export interface WorkerSkills {
  sales: number;
  service: number;
  product: number;
  admin: number;
  management: number;
}

export type WorkerStatus = "idle" | "thinking" | "moving" | "working" | "meeting" | "resting";

export interface WorkerAgent {
  id: string;
  name: string;
  role: "founder" | "sales" | "service" | "product" | "admin";
  skills: WorkerSkills;
  status: WorkerStatus;
  currentTaskId?: string;
  position: Position;
  targetPosition: Position;
  targetZone?: OfficeZoneType;
  monthlyCapacityHours: number;
  usedHours: number;
  workload: number;
  consecutiveWorkMinutes: number;
  statusMinutes: number;
  todayHours: Record<WorkDepartment, number>;
  actionSummary: string;
}

export interface BusinessTask {
  id: string;
  type: BusinessTaskType;
  title: string;
  department: WorkDepartment;
  priority: number;
  requiredHours: number;
  progressHours: number;
  status: "queued" | "active" | "completed" | "blocked" | "cancelled";
  assignedWorkerId?: string;
  relatedLeadId?: string;
  relatedContractId?: string;
  createdAt: number;
  completedAt?: number;
  blockedReason?: "dependency" | "capacity";
}

export interface Lead {
  id: string;
  sequence: number;
  month: number;
  status: "new" | "contacted" | "proposal" | "won" | "lost";
  marketSample: number;
  createdAt: number;
}

export interface Contract {
  id: string;
  sequence: number;
  leadId: string;
  productId: string;
  price: number;
  requiredDeliveryHours: number;
  status: "signed" | "in_delivery" | "delivered" | "cancelled";
  signedAt: number;
  deliveredAt?: number;
}

export interface ProductState extends ProductConfig {
  developmentProgressHours: number;
  aiDevelopmentProgressHours: number;
}

export interface FinancialState {
  cash: number;
  recognizedRevenue: number;
  knownCosts: number;
  knownProfit: number;
  fixedCosts: number;
  variableCosts?: number;
  currentMonthRevenue: number;
  currentMonthFixedCost: number;
  currentMonthVariableCost?: number;
  cashShortage: boolean;
  partialModel: boolean;
}

export interface ManagementState {
  strategy: ManagementStrategy;
  currentPriority: ManagementPriority;
  rationale: string;
  targetMonthlyProfit: number;
  lastReviewMonth: number;
}

export type BusinessEventType =
  | "company_started"
  | "lead_arrived"
  | "lead_contacted"
  | "proposal_completed"
  | "contract_won"
  | "contract_lost"
  | "service_started"
  | "service_delivered"
  | "revenue_recognized"
  | "expense_recorded"
  | "task_started"
  | "task_completed"
  | "task_blocked"
  | "daily_review"
  | "monthly_review"
  | "management_decision"
  | "experiment_created";

export interface BusinessEvent {
  id: string;
  type: BusinessEventType;
  message: string;
  tone: "neutral" | "success" | "warning" | "finance";
  month: number;
  day: number;
  minuteOfDay: number;
  elapsedWorkMinutes: number;
  entityId?: string;
  amount?: number;
}

export interface DailyHistory {
  month: number;
  day: number;
  completedTasks: number;
  hoursWorked: number;
  backlog: number;
}

export interface MonthlyHistory {
  month: number;
  leads: number;
  contracts: number;
  deliveredContracts: number;
  revenue: number;
  knownCost: number;
  knownProfit: number;
  endingCash: number;
  capacityHours: number;
  backlog: number;
}

export interface CompanyHistory {
  daily: DailyHistory[];
  monthly: MonthlyHistory[];
}

export interface CompanyState {
  schemaVersion: 1;
  seed: number;
  nextEntityId: number;
  clock: SimulationClockState;
  finances: FinancialState;
  businessPlan: BusinessPlan;
  scenario: ScenarioId;
  leads: Lead[];
  contracts: Contract[];
  products: ProductState[];
  workers: WorkerAgent[];
  tasks: BusinessTask[];
  management: ManagementState;
  events: BusinessEvent[];
  history: CompanyHistory;
  generatedExternalEventKeys: string[];
}

