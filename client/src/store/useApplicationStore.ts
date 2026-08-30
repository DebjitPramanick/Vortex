import { create } from "zustand";
import { applicationRepository } from "../data/defaultApplicationRepository.ts";
import type {
  ApplicationRepository,
  JobApplication,
  NewApplication,
  StatusHistoryEntry,
} from "@app-types";

type ApplicationStore = {
  applications: JobApplication[];
  selected: JobApplication | null;
  statusHistory: StatusHistoryEntry[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<JobApplication | null>;
  create: (input: NewApplication) => Promise<JobApplication>;
  update: (
    id: string,
    changes: Partial<JobApplication>,
  ) => Promise<JobApplication>;
  remove: (id: string) => Promise<void>;
  fetchStatusHistory: (applicationId: string) => Promise<StatusHistoryEntry[]>;
};

export function createApplicationStore(repository: ApplicationRepository) {
  return create<ApplicationStore>((set, get) => ({
    applications: [],
    selected: null,
    statusHistory: [],
    loading: false,
    error: null,

    fetchAll: async () => {
      set({ loading: true, error: null });
      try {
        const applications = await repository.getAll();
        set({ applications, loading: false });
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
          applications: [created, ...get().applications],
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
          applications: get().applications.map((row) =>
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
          applications: get().applications.filter((row) => row.id !== id),
          selected: get().selected?.id === id ? null : get().selected,
          loading: false,
        });
      } catch (error) {
        set({ loading: false, error: toMessage(error) });
        throw error;
      }
    },

    fetchStatusHistory: async (applicationId) => {
      set({ loading: true, error: null });
      try {
        const statusHistory = await repository.getStatusHistory(applicationId);
        set({ statusHistory, loading: false });
        return statusHistory;
      } catch (error) {
        set({ loading: false, error: toMessage(error) });
        throw error;
      }
    },
  }));
}

export const useApplicationStore = createApplicationStore(
  applicationRepository,
);

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}

declare global {
  interface Window {
    useApplicationStore: typeof useApplicationStore;
  }
}

if (import.meta.env.DEV && typeof window !== "undefined") {
  window.useApplicationStore = useApplicationStore;
}
