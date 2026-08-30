import { create } from "zustand";
import { resumeScoreRepository } from "../data/defaultResumeScoreRepository.ts";
import type {
  NewResumeScore,
  ResumeScore,
  ResumeScoreRepository,
} from "../types/resumeScore.ts";

type ResumeScoreStore = {
  scores: ResumeScore[];
  selected: ResumeScore | null;
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<ResumeScore | null>;
  fetchByApplicationId: (applicationId: string) => Promise<ResumeScore[]>;
  create: (input: NewResumeScore) => Promise<ResumeScore>;
  update: (
    id: string,
    changes: Partial<Omit<ResumeScore, "id" | "created_at">>,
  ) => Promise<ResumeScore>;
  remove: (id: string) => Promise<void>;
};

export function createResumeScoreStore(repository: ResumeScoreRepository) {
  return create<ResumeScoreStore>((set, get) => ({
    scores: [],
    selected: null,
    loading: false,
    error: null,

    fetchAll: async () => {
      set({ loading: true, error: null });
      try {
        const scores = await repository.getAll();
        set({ scores, loading: false });
      } catch (error) {
        set({ loading: false, error: toMessage(error) });
        throw error;
      }
    },

    fetchById: async (id) => {
      set({ loading: true, error: null });
      try {
        const selected = await repository.getById(id);
        set({ selected, loading: false });
        return selected;
      } catch (error) {
        set({ loading: false, error: toMessage(error) });
        throw error;
      }
    },

    fetchByApplicationId: async (applicationId) => {
      set({ loading: true, error: null });
      try {
        const scores = await repository.getByApplicationId(applicationId);
        set({ scores, loading: false });
        return scores;
      } catch (error) {
        set({ loading: false, error: toMessage(error) });
        throw error;
      }
    },

    create: async (input) => {
      set({ loading: true, error: null });
      try {
        const created = await repository.create(input);
        set({
          scores: [created, ...get().scores],
          loading: false,
        });
        return created;
      } catch (error) {
        set({ loading: false, error: toMessage(error) });
        throw error;
      }
    },

    update: async (id, changes) => {
      set({ loading: true, error: null });
      try {
        const updated = await repository.update(id, changes);
        set({
          scores: get().scores.map((row) => (row.id === id ? updated : row)),
          selected: get().selected?.id === id ? updated : get().selected,
          loading: false,
        });
        return updated;
      } catch (error) {
        set({ loading: false, error: toMessage(error) });
        throw error;
      }
    },

    remove: async (id) => {
      set({ loading: true, error: null });
      try {
        await repository.remove(id);
        set({
          scores: get().scores.filter((row) => row.id !== id),
          selected: get().selected?.id === id ? null : get().selected,
          loading: false,
        });
      } catch (error) {
        set({ loading: false, error: toMessage(error) });
        throw error;
      }
    },
  }));
}

export const useResumeScoreStore = createResumeScoreStore(resumeScoreRepository);

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}
