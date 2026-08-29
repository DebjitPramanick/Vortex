export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type Source = "indeed" | "linkedin" | "glassdoor" | "other" | "referred";
export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "NZD"
  | "CHF"
  | "JPY"
  | "CNY"
  | "INR"
  | "BRL"
  | "OTHER";

export type Salary = {
  amount: number;
  currency: Currency;
};

export type JobApplication = {
  id: string;
  user_id: string;
  company: string;
  role: string;
  salary: Salary | null;
  status: ApplicationStatus;
  source: Source | null;
  location: string;
  job_url: string;
  job_description: string | null;
  notes: string | null;
  applied_at: string;
  created_at: string;
  updated_at: string;
};

export type NewApplication = {
  company: string;
  role: string;
  salary?: Salary | null;
  status?: ApplicationStatus;
  source?: Source | null;
  location: string;
  job_url: string;
  job_description?: string | null;
  notes?: string | null;
  applied_at: string;
};

export type StatusHistoryEntry = {
  id: string;
  application_id: string;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  changed_at: string;
};

export type ApplicationRepository = {
  getAll(): Promise<JobApplication[]>;
  getById(id: string): Promise<JobApplication | null>;
  create(input: NewApplication): Promise<JobApplication>;
  update(id: string, changes: Partial<JobApplication>): Promise<JobApplication>;
  remove(id: string): Promise<void>;
  getStatusHistory(applicationId: string): Promise<StatusHistoryEntry[]>;
};
