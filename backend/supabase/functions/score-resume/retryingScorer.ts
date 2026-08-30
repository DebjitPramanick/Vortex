// supabase/functions/score-resume/retryingScorer.ts
import { ResumeScorer, ScoreResult, ScorerError } from "./scorer.ts";

export type RetryingScorerOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
};

const RETRYABLE_REASONS: ReadonlySet<ScorerError["reason"]> = new Set([
  "timeout",
  "rate_limit",
  "http_error",
  "bad_response",
]);

export class RetryingScorer implements ResumeScorer {
  readonly name: string;
  private readonly inner: ResumeScorer;
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;

  constructor(inner: ResumeScorer, options: RetryingScorerOptions = {}) {
    this.inner = inner;
    this.name = inner.name;
    this.maxAttempts = options.maxAttempts ?? 3;
    this.baseDelayMs = options.baseDelayMs ?? 400;
  }

  async score(
    jobDescription: string,
    resumeText: string,
  ): Promise<ScoreResult> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        return await this.inner.score(jobDescription, resumeText);
      } catch (err) {
        lastError = err;
        const retryable =
          err instanceof ScorerError && RETRYABLE_REASONS.has(err.reason);

        if (!retryable || attempt === this.maxAttempts) {
          throw err;
        }

        await delay(backoffMs(this.baseDelayMs, attempt, err.reason));
      }
    }

    throw lastError;
  }
}

function backoffMs(
  baseDelayMs: number,
  attempt: number,
  reason: ScorerError["reason"],
): number {
  const exponential = baseDelayMs * 2 ** (attempt - 1);
  return reason === "rate_limit" ? exponential * 4 : exponential;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
