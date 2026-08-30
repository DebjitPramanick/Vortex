import { create } from "zustand";
import { profileRepository } from "../data/defaultProfileRepository.ts";
import type { NewProfile, Profile, ProfileRepository } from "@app-types";

type ProfileStore = {
  profiles: Profile[];
  selected: Profile | null;
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<Profile | null>;
  create: (input: NewProfile) => Promise<Profile>;
  update: (
    id: string,
    changes: Partial<Pick<Profile, "name" | "notes" | "resume_text">>,
  ) => Promise<Profile>;
  remove: (id: string) => Promise<void>;
  getResumeUrl: (path: string) => Promise<string>;
};

export function createProfileStore(repository: ProfileRepository) {
  return create<ProfileStore>((set, get) => ({
    profiles: [],
    selected: null,
    loading: false,
    error: null,

    fetchAll: async () => {
      set({ loading: true, error: null });
      try {
        const profiles = await repository.getAll();
        set({ profiles, loading: false });
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

    create: async (input) => {
      set({ loading: true, error: null });
      try {
        const created = await repository.create(input);
        set({
          profiles: [created, ...get().profiles],
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
          profiles: get().profiles.map((row) =>
            row.id === id ? updated : row,
          ),
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
          profiles: get().profiles.filter((row) => row.id !== id),
          selected: get().selected?.id === id ? null : get().selected,
          loading: false,
        });
      } catch (error) {
        set({ loading: false, error: toMessage(error) });
        throw error;
      }
    },

    getResumeUrl: async (path) => {
      return repository.getResumeUrl(path);
    },
  }));
}

export const useProfileStore = createProfileStore(profileRepository);

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}
