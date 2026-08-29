import { fetchLocation } from "./location.helper.ts";
import type { JobType, NewApplication } from "../types/application";

export type FetchedJobDetails = Pick<
  NewApplication,
  "company" | "role" | "location" | "job_url" | "job_type"
> & {
  job_description: string | null;
};

export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export const JOB_TYPES = ["remote", "onsite", "hybrid"] as const;

export const SOURCES = [
  "indeed",
  "linkedin",
  "glassdoor",
  "other",
  "referred",
] as const;

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

class InformationExtractor {
  private html: string;
  private parsed: URL;

  constructor(html: string, parsed: URL) {
    this.html = html;
    this.parsed = parsed;
  }

  private textContent(selector: string): string {
    const doc = new DOMParser().parseFromString(this.html, "text/html");
    const node = doc.querySelector(selector);
    return (
      node?.getAttribute("content")?.trim() || node?.textContent?.trim() || ""
    );
  }

  private getOgTitle(): string {
    return this.textContent('meta[property="og:title"]');
  }

  private getPageTitle(): string {
    return this.textContent("title");
  }

  private getCompany(): string {
    let company = this.textContent('meta[property="og:site_name"]');
    if (!company) {
      company = this.parsed.hostname.replace(/^www\./, "");
    }
    if (!company) {
      company = this.getPageTitle().split("@")[1]?.trim();
    }
    if (!company) {
      company = this.getPageTitle().split("@")[1]?.trim();
    }
    console.log("company", this.getPageTitle(), company);
    return company;
  }

  private getJobDescription(): string {
    let description = this.textContent('meta[name="description"]');
    if (!description) {
      description = this.textContent('meta[property="og:description"]');
    }
    if (!description) {
      description = this.getPageTitle();
    }
    return description;
  }

  private getRole(): string {
    const title = (this.getOgTitle() ?? "").split(/[|\-–—]/)[0]?.trim();

    return title;
  }

  private getLocation(): string {
    let location = this.textContent('meta[name="location"]');
    if (!location) {
      location = this.textContent('meta[property="og:location"]');
    }
    return location ?? "Remote";
  }

  private getSalary(): number | null {
    let salary = this.textContent('meta[name="salary"]');
    if (!salary) {
      salary = this.textContent('meta[property="og:salary"]');
    }
    if (!salary) {
      return null;
    }
    return parseInt(salary);
  }

  private getJobType(): JobType | null {
    const location = this.getLocation();
    const value = location.toLowerCase();
    if (/\bhybrid\b/.test(value)) return "hybrid";
    if (/\bremote\b/.test(value)) return "remote";
    return null;
  }

  public extract() {
    return {
      company: this.getCompany(),
      role: this.getRole(),
      location: this.getLocation(),
      job_url: this.parsed.href,
      salary: this.getSalary(),
      job_description: this.getJobDescription(),
      job_type: this.getJobType(),
    };
  }
}

export async function fetchJobDetailsFromUrl(
  rawUrl: string,
): Promise<FetchedJobDetails> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("Enter a valid job listing URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Enter a valid job listing URL.");
  }

  let html: string;
  try {
    const response = await fetch(
      `/api/fetch-job?url=${encodeURIComponent(parsed.href)}`,
      { signal: AbortSignal.timeout(12000) },
    );
    const payload = (await response.json()) as {
      html?: string;
      error?: string;
    };
    if (!response.ok || !payload.html) {
      throw new Error(
        payload.error || "Could not fetch job details from this URL.",
      );
    }
    html = payload.html;
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error("Could not fetch job details from this URL.", {
      cause: error,
    });
  }

  const extractor = new InformationExtractor(html, parsed);
  const jobDetails = extractor.extract();

  if (!jobDetails.role) {
    throw new Error("Could not fetch job details from this URL.");
  }

  return {
    ...jobDetails,
    location: await fetchLocation(jobDetails.location),
  };
}
