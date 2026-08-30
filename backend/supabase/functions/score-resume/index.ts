// supabase/functions/score-resume/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { GeminiScorer } from "./geminiScorer.ts";
import { MistralScorer } from "./mistralScorer.ts";
import { RetryingScorer } from "./retryingScorer.ts";
import {
  ScoringOrchestrator,
  AllProvidersFailedError,
} from "./orchestrator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const orchestrator = new ScoringOrchestrator([
  new RetryingScorer(new GeminiScorer()),
  new RetryingScorer(new MistralScorer()),
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { jobDescription, resumeText } = await req.json();
    if (!jobDescription || !resumeText) {
      return jsonResponse(
        { error: "Missing jobDescription or resumeText" },
        400,
      );
    }

    const { result, attempts } = await orchestrator.score(
      jobDescription,
      resumeText,
    );

    return jsonResponse({ ...result, attempts });
  } catch (err) {
    if (err instanceof AllProvidersFailedError) {
      return jsonResponse(
        {
          error: "All providers failed",
          attempts: err.attempts,
        },
        502,
      );
    }
    return jsonResponse({ error: String(err) }, 500);
  }
});
