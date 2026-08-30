export type Profile = {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  resume_path: string;
  resume_file_name: string;
  resume_text: string | null;
  created_at: string;
  updated_at: string;
};

export type NewProfile = {
  name: string;
  notes?: string | null;
  resume: File;
  resume_text?: string | null;
};

export type ProfileRepository = {
  getAll(): Promise<Profile[]>;
  getById(id: string): Promise<Profile | null>;
  create(input: NewProfile): Promise<Profile>;
  update(
    id: string,
    changes: Partial<Pick<Profile, "name" | "notes" | "resume_text">>,
  ): Promise<Profile>;
  remove(id: string): Promise<void>;
  getResumeUrl(path: string): Promise<string>;
};
