import { supabase } from "../lib/supabaseClient.ts";
import { SupabaseProfileRepository } from "./SupabaseProfileRepository.ts";

export const profileRepository = new SupabaseProfileRepository(supabase);
