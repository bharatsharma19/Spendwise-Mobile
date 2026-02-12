import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { authApi } from "../api/auth.api";
import { supabase } from "../api/supabase";
import { RegisterDto, UserProfile } from "../types";

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        set({ session, isAuthenticated: true });
        try {
          const user = await authApi.getCurrentUser();
          set({ user });
        } catch {
          // Profile fetch failed — still authenticated via session
        }
      }
    } catch {
      set({ session: null, user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    const { session } = await authApi.login(email, password);
    set({ session, isAuthenticated: true });

    try {
      const user = await authApi.getCurrentUser();
      set({ user });
    } catch {
      // Profile may not be ready yet
    }
  },

  register: async (data: RegisterDto) => {
    // 1. Register via backend (creates profile in Supabase)
    await authApi.register(data);
    // 2. Login via Supabase client SDK
    await get().login(data.email, data.password);
  },

  logout: async () => {
    await authApi.logout();
    set({ session: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
