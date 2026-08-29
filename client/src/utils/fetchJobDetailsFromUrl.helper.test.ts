import { describe, expect, it } from "vitest";
import { extractJobDetailsFromHtml } from "./fetchJobDetailsFromUrl.helper.ts";

const KEKA_JOB_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="portalName">
</head>
<body>
  <header class="navbar">
    <a id="home" class="navbar-brand">
      <img class="org-logo" alt="Keka Hire" src="/logo.png" />
    </a>
  </header>
  <div class="job-details-container">
    <div class="banner">
      <h1 class="kch-text-heading" title="Software Development Engineer - Frontend">Software Development Engineer - Frontend</h1>
      <div class="d-flex align-items-center">
        <span class="icon ki-location"></span>
        <span>Bengaluru</span>
      </div>
      <div class="d-flex align-items-center">
        <span class="icon ki-briefcase"></span>
        <span>Full-Time</span>
      </div>
    </div>
    <div class="job-description-container">
      <div><strong>The Impact You’ll Drive</strong></div>
      <div>We’re on the lookout for a talented Frontend Developer with React JS expertise to join our team!</div>
      <div><em>The Hats You Will Wear</em></div>
      <ul>
        <li><span>Design, develop, and optimize responsive web applications using React JS.</span></li>
        <li><span>Collaborate with UX/UI designers and backend developers to implement new features.</span></li>
      </ul>
      <div><strong>The Perfect Fit</strong></div>
      <ul>
        <li><span>2+ years of experience in frontend development.</span></li>
        <li><span>Strong proficiency in React JS and related technologies (Redux, React Hooks, etc.).</span></li>
      </ul>
    </div>
  </div>
</body>
</html>`;

describe("extractJobDetailsFromHtml", () => {
  it("parses Keka career-portal HTML without JSON-LD", () => {
    const details = extractJobDetailsFromHtml(
      KEKA_JOB_HTML,
      "https://vegapay.keka.com/careers/jobdetails/86230",
    );

    expect(details.role).toBe("Software Development Engineer - Frontend");
    expect(details.location).toBe("Bengaluru");
    expect(details.company).toBe("Vegapay");
    expect(details.job_description).toContain("The Impact You’ll Drive");
    expect(details.job_description).toContain(
      "Design, develop, and optimize responsive web applications using React JS.",
    );
    expect(details.job_description).toContain(
      "Strong proficiency in React JS and related technologies",
    );
    expect(details.job_description).not.toContain("<li>");
  });

  it("prefers JSON-LD JobPosting when present", () => {
    const html = `<html><head>
      <script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: "Staff Engineer",
        description: "<p>Build the platform.</p><ul><li>TypeScript</li></ul>",
        hiringOrganization: { name: "Acme" },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Austin",
            addressRegion: "TX",
          },
        },
      })}</script>
    </head><body><h1>Ignore me</h1></body></html>`;

    const details = extractJobDetailsFromHtml(
      html,
      "https://jobs.acme.com/staff-engineer",
    );

    expect(details.role).toBe("Staff Engineer");
    expect(details.company).toBe("Acme");
    expect(details.location).toBe("Austin, TX");
    expect(details.job_description).toContain("Build the platform.");
    expect(details.job_description).toContain("TypeScript");
  });
});
