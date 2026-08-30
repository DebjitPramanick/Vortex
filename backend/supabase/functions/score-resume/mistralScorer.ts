// supabase/functions/score-resume/mistralScorer.ts
import { ResumeScorer, ScoreResult, ScorerError } from "./scorer.ts";
import { buildPrompt } from "./prompt.ts";

const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY")!;
const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

export class MistralScorer implements ResumeScorer {
  readonly name = "mistral-large-latest";

  async score(
    jobDescription: string,
    resumeText: string,
  ): Promise<ScoreResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let res: Response;
    try {
      res = await fetch(MISTRAL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.name,
          messages: [
            { role: "user", content: buildPrompt(jobDescription, resumeText) },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });
    } catch (err) {
      if (err.name === "AbortError")
        throw new ScorerError(
          this.name,
          "timeout",
          "Mistral request timed out",
        );
      throw new ScorerError(this.name, "http_error", String(err));
    } finally {
      clearTimeout(timeout);
    }

    if (res.status === 429)
      throw new ScorerError(this.name, "rate_limit", "Mistral rate limited");
    if (!res.ok)
      throw new ScorerError(
        this.name,
        "http_error",
        `Mistral returned ${res.status}`,
      );

    const data = await res.json();
    try {
      const parsed = JSON.parse(data.choices[0].message.content);
      return { ...parsed, model: this.name };
    } catch {
      throw new ScorerError(
        this.name,
        "bad_response",
        "Mistral returned unparseable JSON",
      );
    }
  }
}
