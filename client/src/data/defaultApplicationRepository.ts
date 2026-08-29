import { supabase } from "../lib/supabaseClient.ts";
import { SupabaseApplicationRepository } from "./SupabaseApplicationRepository.ts";

export const applicationRepository = new SupabaseApplicationRepository(
  supabase,
);
