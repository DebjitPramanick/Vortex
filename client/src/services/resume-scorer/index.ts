import type { JobApplication } from "@app-types/application";
import type { Profile } from "@app-types/profile";

export type ScoreResumeResult = {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  summary: string;
  model: string;
};

class ResumeScorer {
  private profile: Profile;
  private application: JobApplication;
  private baseUrl: string;
  private anonKey: string;

  constructor(profile: Profile, application: JobApplication) {
    this.profile = profile;
    this.application = application;
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  public async score(): Promise<ScoreResumeResult> {
    if (!this.profile.resume_text?.trim()) {
      throw new Error(
        "This profile has no parsed resume text. Parse the resume on the Profiles page first.",
      );
    }
    if (!this.application.job_description?.trim()) {
      throw new Error(
        "Add a job description before scoring a profile against this listing.",
      );
    }

    const response = await fetch(`${this.baseUrl}/functions/v1/score-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.anonKey}`,
        apikey: this.anonKey,
      },
      body: JSON.stringify({
        jobDescription: this.application.job_description,
        resumeText: this.profile.resume_text,
      }),
    });

    const data = (await response.json()) as ScoreResumeResult & {
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error ?? "Failed to score resume");
    }
    if (typeof data.score !== "number") {
      throw new Error("Invalid score response");
    }

    return {
      score: data.score,
      matched_skills: data.matched_skills ?? [],
      missing_skills: data.missing_skills ?? [],
      summary: data.summary ?? "",
      model: data.model ?? "unknown",
    };
  }
}

export default ResumeScorer;
