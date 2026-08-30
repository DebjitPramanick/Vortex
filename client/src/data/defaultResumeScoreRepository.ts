import { supabase } from "../lib/supabaseClient.ts";
import { SupabaseResumeScoreRepository } from "./SupabaseResumeScoreRepository.ts";

export const resumeScoreRepository = new SupabaseResumeScoreRepository(
  supabase,
);
