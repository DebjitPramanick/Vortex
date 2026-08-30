// supabase/functions/score-resume/scorer.ts
export interface ScoreResult {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  summary: string;
  model: string; // which model actually produced this
}

export interface ResumeScorer {
  readonly name: string;
  score(jobDescription: string, resumeText: string): Promise<ScoreResult>;
}

export class ScorerError extends Error {
  constructor(
    public provider: string,
    public reason: "timeout" | "rate_limit" | "bad_response" | "http_error",
    message: string,
  ) {
    super(message);
  }
}
