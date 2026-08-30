import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  NewProfile,
  Profile,
  ProfileRepository,
  Database,
} from "@app-types";

export const RESUMES_BUCKET = "resumes";
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

function assertPdf(file: File): void {
  const typeOk =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!typeOk) {
    throw new Error("Resume must be a PDF.");
  }
  if (file.size > MAX_RESUME_BYTES) {
    throw new Error("Resume must be 10 MB or smaller.");
  }
}

export function safeResumeFileName(name: string): string {
  const trimmed = name.trim() || "resume.pdf";
  const base = trimmed.replace(/[^\w.\-]+/g, "_").replace(/^\.+/, "");
  const withExt = base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
  return withExt.slice(0, 180);
}

export class SupabaseProfileRepository implements ProfileRepository {
  private readonly client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  async getAll(): Promise<Profile[]> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    throwIfError(error);
    return data ?? [];
  }

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    throwIfError(error);
    return data;
  }

  async create(input: NewProfile): Promise<Profile> {
    assertPdf(input.resume);

    const {
      data: { user },
      error: authError,
    } = await this.client.auth.getUser();

    throwIfError(authError);
    if (!user) {
      throw new Error("Not signed in");
    }

    const id = crypto.randomUUID();
    const fileName = safeResumeFileName(input.resume.name);
    const resumePath = `${user.id}/${id}/${fileName}`;

    const { error: uploadError } = await this.client.storage
      .from(RESUMES_BUCKET)
      .upload(resumePath, input.resume, {
        contentType: "application/pdf",
        upsert: false,
      });

    throwIfError(uploadError);

    const { data, error } = await this.client
      .from("profiles")
      .insert({
        id,
        user_id: user.id,
        name: input.name.trim(),
        notes: input.notes?.trim() ? input.notes.trim() : null,
        resume_path: resumePath,
        resume_file_name: fileName,
        resume_text: input.resume_text?.trim() ? input.resume_text : null,
      })
      .select("*")
      .single();

    if (error || !data) {
      await this.client.storage.from(RESUMES_BUCKET).remove([resumePath]);
      throwIfError(error);
      throw new Error("Failed to create profile");
    }

    return data;
  }

  async update(
    id: string,
    changes: Partial<Pick<Profile, "name" | "notes" | "resume_text">>,
  ): Promise<Profile> {
    const payload: ProfileUpdate = {};
    if (changes.name !== undefined) payload.name = changes.name;
    if (changes.notes !== undefined) payload.notes = changes.notes;
    if (changes.resume_text !== undefined) {
      payload.resume_text = changes.resume_text;
    }

    const { data, error } = await this.client
      .from("profiles")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    throwIfError(error);
    if (!data) {
      throw new Error("Failed to update profile");
    }
    return data;
  }

  async remove(id: string): Promise<void> {
    const current = await this.getById(id);
    if (!current) {
      throw new Error(`Profile ${id} not found`);
    }

    const { error } = await this.client.from("profiles").delete().eq("id", id);
    throwIfError(error);

    const { error: storageError } = await this.client.storage
      .from(RESUMES_BUCKET)
      .remove([current.resume_path]);
    throwIfError(storageError);
  }

  async getResumeUrl(path: string): Promise<string> {
    const { data, error } = await this.client.storage
      .from(RESUMES_BUCKET)
      .createSignedUrl(path, 120);

    throwIfError(error);
    if (!data?.signedUrl) {
      throw new Error("Could not open resume.");
    }
    return data.signedUrl;
  }
}
