import { fetchLocation } from "./location.helper.ts";
import type { JobType, NewApplication } from "../types/application";
import * as cheerio from "cheerio";

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

type CheerioAPI = ReturnType<typeof cheerio.load>;

class InformationExtractor {
  private $: CheerioAPI;
  private parsed: URL;
  private jobPosting: Record<string, unknown> | null;
  private atsBrands: string[] = [
    "keka",
    "smartrecruiters",
    "ashby",
    "lever",
    "greenhouse",
    "workable",
    "jobvite",
    "jobscore",
    "jobsoid",
    "workday",
  ];

  constructor(html: string, parsed: URL) {
    this.$ = cheerio.load(html);
    this.parsed = parsed;
    this.jobPosting = this.findJobPosting(this.extractJsonLd());
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private asString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
  }

  private looksLikeAtsBrand(value: string): boolean {
    return this.atsBrands.some((brand) =>
      value.toLowerCase().includes(brand.toLowerCase()),
    );
  }

  private extractJsonLd(): unknown[] {
    const results: unknown[] = [];

    this.$('script[type="application/ld+json"]').each((_, element) => {
      const content = this.$(element).html()?.trim();
      if (!content) return;

      try {
        const parsed: unknown = JSON.parse(content);
        if (Array.isArray(parsed)) {
          results.push(...parsed);
        } else {
          results.push(parsed);
        }
      } catch {
        // Ignore malformed JSON-LD
      }
    });

    return results;
  }

  private findJobPosting(nodes: unknown[]): Record<string, unknown> | null {
    for (const node of nodes) {
      if (Array.isArray(node)) {
        const nested = this.findJobPosting(node);
        if (nested) return nested;
        continue;
      }

      if (!this.isRecord(node)) continue;

      const type = node["@type"];
      const types = Array.isArray(type) ? type : [type];
      if (types.includes("JobPosting")) {
        return node;
      }

      if (Array.isArray(node["@graph"])) {
        const nested = this.findJobPosting(node["@graph"]);
        if (nested) return nested;
      }
    }

    return null;
  }

  private attr(selector: string, attribute = "content"): string {
    return this.$(selector).first().attr(attribute)?.trim() ?? "";
  }

  private firstMatchingText(selectors: string[]): string {
    for (const selector of selectors) {
      const text = this.plainText(this.$(selector).first());
      if (text) return text;
    }
    return "";
  }

  private plainText($el: ReturnType<CheerioAPI>): string {
    if (!$el.length) return "";

    const clone = $el.clone();
    clone.find("script, style, noscript").remove();
    clone.find("br").replaceWith("\n");
    clone.find("li").prepend("• ");
    clone.find("li").append("\n");
    clone.find("p, div, h1, h2, h3, h4, section, tr").append("\n");

    return clone
      .text()
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  private htmlToPlainText(html: string): string {
    return this.plainText(
      cheerio.load(`<div id="vx-html">${html}</div>`)("#vx-html"),
    );
  }

  private jsonLdOrganizationName(): string {
    const org = this.jobPosting?.hiringOrganization;
    if (typeof org === "string") return org.trim();
    if (this.isRecord(org)) return this.asString(org.name);
    return "";
  }

  private jsonLdLocation(): string {
    const location = this.jobPosting?.jobLocation;
    const locations = Array.isArray(location) ? location : [location];

    for (const entry of locations) {
      if (typeof entry === "string" && entry.trim()) return entry.trim();
      if (!this.isRecord(entry)) continue;

      const address = entry.address;
      if (typeof address === "string" && address.trim()) return address.trim();
      if (this.isRecord(address)) {
        const locality = this.asString(address.addressLocality);
        const region = this.asString(address.addressRegion);
        const country = this.asString(address.addressCountry);
        const parts = [locality, region, country].filter(Boolean);
        if (parts.length) return parts.join(", ");
      }

      const named = this.asString(entry.name);
      if (named) return named;
    }

    return "";
  }

  private companyFromHost(): string {
    const host = this.parsed.hostname.replace(/^www\./, "");
    const kekaMatch = host.match(/^([a-z0-9-]+)\.keka\./i);
    if (kekaMatch?.[1] && kekaMatch[1].toLowerCase() !== "keka") {
      return kekaMatch[1]
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    return host;
  }

  private getCompany(): string {
    const fromLd = this.jsonLdOrganizationName();
    if (fromLd && !this.looksLikeAtsBrand(fromLd)) return fromLd;

    const siteName = this.attr('meta[property="og:site_name"]');
    if (siteName && !this.looksLikeAtsBrand(siteName)) return siteName;

    const logoAlt = this.attr("img.org-logo, .navbar-brand img", "alt");
    if (logoAlt && !this.looksLikeAtsBrand(logoAlt)) return logoAlt;

    const titleCompany = this.firstMatchingText(["title"])
      .split("@")[1]
      ?.trim();
    if (titleCompany && !this.looksLikeAtsBrand(titleCompany))
      return titleCompany;

    return this.companyFromHost();
  }

  private getJobDescription(): string {
    const fromLd = this.asString(this.jobPosting?.description);
    if (fromLd) {
      return /<\/?[a-z][\s\S]*>/i.test(fromLd)
        ? this.htmlToPlainText(fromLd)
        : fromLd;
    }

    const fromHtml = this.firstMatchingText([
      ".job-description-container",
      "[class*='job-description']",
      "#job-description",
      "[itemprop='description']",
      "article",
    ]);
    if (fromHtml) return fromHtml;

    return (
      this.attr('meta[name="description"]') ||
      this.attr('meta[property="og:description"]') ||
      this.firstMatchingText(["title"])
    );
  }

  private getRole(): string {
    const fromLd = this.asString(this.jobPosting?.title);
    if (fromLd) return fromLd;

    const heading = this.firstMatchingText([
      "h1.kch-text-heading",
      ".job-details-container h1",
      ".banner h1",
      "h1[title]",
      "h1",
    ]);
    if (heading) return heading;

    const ogTitle = this.attr('meta[property="og:title"]');
    return ogTitle.split(/\s*[|–—]\s*/)[0]?.trim() ?? "";
  }

  private getLocation(): string {
    const fromLd = this.jsonLdLocation();
    if (fromLd) return fromLd;

    const kekaLocation = this.plainText(
      this.$(".ki-location").first().closest("div"),
    );
    if (kekaLocation) return kekaLocation;

    return (
      this.attr('meta[name="location"]') ||
      this.attr('meta[property="og:location"]') ||
      "Remote"
    );
  }

  private getSalary(): number | null {
    const base = this.jobPosting?.baseSalary;
    if (this.isRecord(base)) {
      const value = this.isRecord(base.value) ? base.value : base;
      const amount = value.value ?? value.minValue;
      if (typeof amount === "number") return amount;
      if (typeof amount === "string") {
        const parsed = Number.parseInt(amount.replace(/[^\d]/g, ""), 10);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }

    const salary =
      this.attr('meta[name="salary"]') ||
      this.attr('meta[property="og:salary"]');
    if (!salary) return null;
    const parsed = Number.parseInt(salary.replace(/[^\d]/g, ""), 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private getJobType(): JobType | null {
    const haystack = [
      this.jsonLdLocation(),
      this.asString(this.jobPosting?.jobLocationType),
      this.asString(this.jobPosting?.employmentType),
      this.getLocation(),
      this.plainText(this.$(".ki-briefcase").first().closest("div")),
    ]
      .join(" ")
      .toLowerCase();

    if (/\bhybrid\b/.test(haystack)) return "hybrid";
    if (/\bremote\b/.test(haystack)) return "remote";
    if (/\bonsite\b|\bon-site\b|\bin-office\b/.test(haystack)) return "onsite";
    return null;
  }

  public extract() {
    return {
      company: this.getCompany(),
      role: this.getRole(),
      location: this.getLocation(),
      job_url: this.parsed.href,
      salary: this.getSalary(),
      job_description: this.getJobDescription() || null,
      job_type: this.getJobType(),
    };
  }
}

export function extractJobDetailsFromHtml(html: string, jobUrl: string) {
  return new InformationExtractor(html, new URL(jobUrl)).extract();
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
