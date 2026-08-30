// supabase/functions/score-resume/orchestrator.ts
import { ResumeScorer, ScoreResult, ScorerError } from "./scorer.ts";

export interface AttemptLog {
  provider: string;
  succeeded: boolean;
  reason?: string;
  latencyMs: number;
}

export class AllProvidersFailedError extends Error {
  constructor(public attempts: AttemptLog[]) {
    super("All scoring providers failed");
  }
}

export class ScoringOrchestrator {
  constructor(private providers: ResumeScorer[]) {}

  async score(
    jobDescription: string,
    resumeText: string,
  ): Promise<{ result: ScoreResult; attempts: AttemptLog[] }> {
    const attempts: AttemptLog[] = [];

    for (const provider of this.providers) {
      const start = Date.now();
      try {
        const result = await provider.score(jobDescription, resumeText);
        attempts.push({
          provider: provider.name,
          succeeded: true,
          latencyMs: Date.now() - start,
        });
        return { result, attempts };
      } catch (err) {
        const reason = err instanceof ScorerError ? err.reason : "unknown";
        attempts.push({
          provider: provider.name,
          succeeded: false,
          reason,
          latencyMs: Date.now() - start,
        });
        // rate_limit and timeout are exactly the cases worth falling back on;
        // continue the loop regardless — next provider gets a fresh attempt either way
      }
    }

    throw new AllProvidersFailedError(attempts);
  }
}
