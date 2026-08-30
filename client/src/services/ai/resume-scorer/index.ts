import type { JobApplication } from "@app-types/application";
import type { Profile } from "@app-types/profile";
import type { ResumeScore } from "@app-types/resumeScore";

class ResumeScorer {
  private profile: Profile;
  private application: JobApplication;
  private baseUrl: string;

  constructor(profile: Profile, application: JobApplication) {
    this.profile = profile;
    this.application = application;
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL;
  }

  public async score(): Promise<ResumeScore> {
    if (!this.profile.resume_text || !this.application.job_description) {
      throw new Error("Profile and application are required");
    }
    try {
      const response = await fetch(
        `${this.baseUrl}/functions/v1/score-resume`,
        {
          method: "POST",
          body: JSON.stringify({
            jobDescription: this.application.job_description,
            resumeText: this.profile.resume_text,
          }),
        },
      );
      const data: ResumeScore = await response.json();
      return data;
    } catch (error) {
      throw new Error("Failed to score resume", { cause: error });
    }
  }
}

export default ResumeScorer;
