import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  NewResumeScore,
  ResumeScore,
  ResumeScoreRepository,
  Database,
} from "@app-types";

type ResumeScoreUpdate =
  Database["public"]["Tables"]["resume_scores"]["Update"];

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

export class SupabaseResumeScoreRepository implements ResumeScoreRepository {
  private readonly client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  async getAll(): Promise<ResumeScore[]> {
    const { data, error } = await this.client
      .from("resume_scores")
      .select("*")
      .order("created_at", { ascending: false });

    throwIfError(error);
    return data ?? [];
  }

  async getById(id: string): Promise<ResumeScore | null> {
    const { data, error } = await this.client
      .from("resume_scores")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    throwIfError(error);
    return data;
  }

  async getByApplicationId(applicationId: string): Promise<ResumeScore[]> {
    const { data, error } = await this.client
      .from("resume_scores")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });

    throwIfError(error);
    return data ?? [];
  }

  async create(input: NewResumeScore): Promise<ResumeScore> {
    const { data, error } = await this.client
      .from("resume_scores")
      .insert({
        application_id: input.application_id ?? null,
        score: input.score,
        matched_skills: input.matched_skills,
        missing_skills: input.missing_skills,
        summary: input.summary,
        model: input.model,
      })
      .select("*")
      .single();

    throwIfError(error);
    if (!data) {
      throw new Error("Failed to create resume score");
    }
    return data;
  }

  async update(
    id: string,
    changes: Partial<Omit<ResumeScore, "id" | "created_at">>,
  ): Promise<ResumeScore> {
    const payload: ResumeScoreUpdate = {};
    if (changes.application_id !== undefined) {
      payload.application_id = changes.application_id;
    }
    if (changes.score !== undefined) payload.score = changes.score;
    if (changes.matched_skills !== undefined) {
      payload.matched_skills = changes.matched_skills;
    }
    if (changes.missing_skills !== undefined) {
      payload.missing_skills = changes.missing_skills;
    }
    if (changes.summary !== undefined) payload.summary = changes.summary;
    if (changes.model !== undefined) payload.model = changes.model;

    const { data, error } = await this.client
      .from("resume_scores")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    throwIfError(error);
    if (!data) {
      throw new Error("Failed to update resume score");
    }
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client
      .from("resume_scores")
      .delete()
      .eq("id", id);

    throwIfError(error);
  }
}
