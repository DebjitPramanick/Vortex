import type { ApplicationStatus, JobSource } from "@app-types";

export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const JOB_SOURCES = [
  "indeed",
  "linkedin",
  "glassdoor",
  "google_search",
  "company_website",
  "naukri",
  "reach_out",
  "referred",
  "other",
] as const;

export const JOB_SOURCE_LABELS: Record<JobSource, string> = {
  indeed: "Indeed",
  linkedin: "LinkedIn",
  glassdoor: "Glassdoor",
  google_search: "Google Search",
  company_website: "Company Website",
  naukri: "Naukri",
  reach_out: "Reach Out",
  referred: "Referred",
  other: "Other",
};

export const JOB_TYPES = ["remote", "onsite", "hybrid"] as const;

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "NZD",
  "CHF",
  "JPY",
  "CNY",
  "INR",
  "BRL",
  "OTHER",
] as const;
