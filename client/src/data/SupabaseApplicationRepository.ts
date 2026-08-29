import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ApplicationRepository,
  JobApplication,
  NewApplication,
  StatusHistoryEntry,
} from "../types/application.ts";
import type { Database } from "../types/database.ts";

type ApplicationUpdate = Database["public"]["Tables"]["job_applications"]["Update"];

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

export class SupabaseApplicationRepository implements ApplicationRepository {
  private readonly client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  async getAll(): Promise<JobApplication[]> {
    const { data, error } = await this.client
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });

    throwIfError(error);
    return data ?? [];
  }

  async getById(id: string): Promise<JobApplication | null> {
    const { data, error } = await this.client
      .from("job_applications")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    throwIfError(error);
    return data;
  }

  async create(input: NewApplication): Promise<JobApplication> {
    const {
      data: { user },
      error: authError,
    } = await this.client.auth.getUser();

    throwIfError(authError);
    if (!user) {
      throw new Error("Not signed in");
    }

    const { data, error } = await this.client
      .from("job_applications")
      .insert({
        user_id: user.id,
        company: input.company,
        role: input.role,
        salary: input.salary ?? null,
        status: input.status ?? "saved",
        source: input.source ?? null,
        location: input.location,
        job_url: input.job_url,
        job_description: input.job_description ?? null,
        notes: input.notes ?? null,
        applied_at: input.applied_at,
      })
      .select("*")
      .single();

    throwIfError(error);
    if (!data) {
      throw new Error("Failed to create application");
    }
    return data;
  }

  async update(
    id: string,
    changes: Partial<JobApplication>,
  ): Promise<JobApplication> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error(`Application ${id} not found`);
    }

    const payload = toUpdatePayload(changes);
    const { data, error } = await this.client
      .from("job_applications")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    throwIfError(error);
    if (!data) {
      throw new Error("Failed to update application");
    }

    if (changes.status && changes.status !== current.status) {
      const { error: historyError } = await this.client
        .from("status_history")
        .insert({
          application_id: id,
          from_status: current.status,
          to_status: changes.status,
        });

      throwIfError(historyError);
    }

    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client
      .from("job_applications")
      .delete()
      .eq("id", id);

    throwIfError(error);
  }

  async getStatusHistory(
    applicationId: string,
  ): Promise<StatusHistoryEntry[]> {
    const { data, error } = await this.client
      .from("status_history")
      .select("*")
      .eq("application_id", applicationId)
      .order("changed_at", { ascending: true });

    throwIfError(error);
    return data ?? [];
  }
}

function toUpdatePayload(changes: Partial<JobApplication>): ApplicationUpdate {
  const payload: ApplicationUpdate = {};

  if (changes.company !== undefined) payload.company = changes.company;
  if (changes.role !== undefined) payload.role = changes.role;
  if (changes.salary !== undefined) payload.salary = changes.salary;
  if (changes.status !== undefined) payload.status = changes.status;
  if (changes.source !== undefined) payload.source = changes.source;
  if (changes.location !== undefined) payload.location = changes.location;
  if (changes.job_url !== undefined) payload.job_url = changes.job_url;
  if (changes.job_description !== undefined) {
    payload.job_description = changes.job_description;
  }
  if (changes.notes !== undefined) payload.notes = changes.notes;
  if (changes.applied_at !== undefined) payload.applied_at = changes.applied_at;

  return payload;
}
