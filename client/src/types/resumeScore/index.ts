export type ResumeScore = {
  id: string;
  application_id: string | null;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  summary: string;
  model: string;
  created_at: string | null;
};

export type NewResumeScore = {
  application_id?: string | null;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  summary: string;
  model: string;
};

export type ResumeScoreRepository = {
  getAll(): Promise<ResumeScore[]>;
  getById(id: string): Promise<ResumeScore | null>;
  getByApplicationId(applicationId: string): Promise<ResumeScore[]>;
  create(input: NewResumeScore): Promise<ResumeScore>;
  update(
    id: string,
    changes: Partial<Omit<ResumeScore, "id" | "created_at">>,
  ): Promise<ResumeScore>;
  remove(id: string): Promise<void>;
};
