export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export type JobSource =
  | "indeed"
  | "linkedin"
  | "glassdoor"
  | "google_search"
  | "company_website"
  | "naukri"
  | "reach_out"
  | "referred"
  | "other";

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

export type JobType = "remote" | "onsite" | "hybrid";

export type Location = {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
};

export type JobApplication = {
  id: string;
  user_id: string;
  company: string;
  role: string;
  salary: Salary | null;
  status: ApplicationStatus;
  source: JobSource | null;
  location: Location;
  job_url: string;
  job_description: string | null;
  job_type: JobType | null;
  notes: string | null;
  profile_id: string | null;
  resume_score_id: string | null;
  resume_score: number | null;
  applied_at: string;
  created_at: string;
  updated_at: string;
};

export type NewApplication = {
  company: string;
  role: string;
  salary?: Salary | null;
  status?: ApplicationStatus;
  source?: JobSource | null;
  location: Location;
  job_url: string;
  job_description?: string | null;
  job_type?: JobType | null;
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
