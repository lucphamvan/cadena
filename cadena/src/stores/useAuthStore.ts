import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

const INITIAL_STATE: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem("access_token", accessToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => {
        set({ user });
      },

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("access_token", accessToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem("access_token");
        set(INITIAL_STATE);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
