// supabase/functions/score-resume/geminiScorer.ts
import { ResumeScorer, ScoreResult, ScorerError } from "./scorer.ts";
import { buildPrompt } from "./prompt.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const responseSchema = {
  type: "object",
  properties: {
    score: { type: "integer" },
    matched_skills: { type: "array", items: { type: "string" } },
    missing_skills: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
  },
  required: ["score", "matched_skills", "missing_skills", "summary"],
};

export class GeminiScorer implements ResumeScorer {
  readonly name = "gemini-2.5-flash";

  async score(
    jobDescription: string,
    resumeText: string,
  ): Promise<ScoreResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let res: Response;
    try {
      res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            { parts: [{ text: buildPrompt(jobDescription, resumeText) }] },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.2,
          },
        }),
      });
    } catch (err) {
      if (err.name === "AbortError")
        throw new ScorerError(this.name, "timeout", "Gemini request timed out");
      throw new ScorerError(this.name, "http_error", String(err));
    } finally {
      clearTimeout(timeout);
    }

    if (res.status === 429)
      throw new ScorerError(this.name, "rate_limit", "Gemini rate limited");
    if (!res.ok)
      throw new ScorerError(
        this.name,
        "http_error",
        `Gemini returned ${res.status}`,
      );

    const data = await res.json();
    try {
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      return { ...parsed, model: this.name };
    } catch {
      throw new ScorerError(
        this.name,
        "bad_response",
        "Gemini returned unparseable JSON",
      );
    }
  }
}
