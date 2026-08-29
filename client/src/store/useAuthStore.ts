import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient.ts";

type AuthStore = {
  user: User | null;
  ready: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

let authListenerBound = false;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  ready: false,
  error: null,

  hydrate: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      set({ user: null, ready: true, error: error.message });
      return;
    }
    set({ user: data.session?.user ?? null, ready: true, error: null });

    if (!authListenerBound) {
      authListenerBound = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null });
      });
    }
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      throw error;
    }
  },

  signUp: async (email, password) => {
    set({ error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message });
      throw error;
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      set({ error: error.message });
      throw error;
    }
    set({ user: null });
  },
}));
