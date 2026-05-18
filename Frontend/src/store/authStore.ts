import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  token: string | null;
  // JWT auth role ("user" | "admin"). NOT the Stakeholders profile role
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string) => void;
  clearAuth: () => void;
}

// Only used to extract user info for the UI.
function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.user_id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
          token: null,
          user: null,
          isAuthenticated: false,

          setAuth: (token: string) => {
            const user = decodeToken(token);
            set({ token, user, isAuthenticated: !!user });
          },

          clearAuth: () =>
              set({ token: null, user: null, isAuthenticated: false }),
        }),
        {
          name: "auth-storage", // key in localStorage
        }
    )
);