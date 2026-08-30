// supabase/functions/score-resume/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { GeminiScorer } from "./geminiScorer.ts";
import { MistralScorer } from "./mistralScorer.ts";
import {
  ScoringOrchestrator,
  AllProvidersFailedError,
} from "./orchestrator.ts";

const orchestrator = new ScoringOrchestrator([
  new GeminiScorer(),
  new MistralScorer(),
]);

serve(async (req) => {
  try {
    const { jobDescription, resumeText } = await req.json();
    if (!jobDescription || !resumeText) {
      return new Response(
        JSON.stringify({ error: "Missing jobDescription or resumeText" }),
        { status: 400 },
      );
    }

    const { result, attempts } = await orchestrator.score(
      jobDescription,
      resumeText,
    );

    return new Response(JSON.stringify({ ...result, attempts }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof AllProvidersFailedError) {
      return new Response(
        JSON.stringify({
          error: "All providers failed",
          attempts: err.attempts,
        }),
        { status: 502 },
      );
    }
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
