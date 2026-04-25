import { api } from "./client";
import type { Session } from "@/types/domain";

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  /** Backend sets jetgo_at + jetgo_rt httpOnly cookies. Body returns only { user, organization }. */
  login: (input: LoginInput) => api.post<Session>("/auth/login", input),
  logout: () => api.post<void>("/auth/logout"),
  me: () => api.get<Session>("/auth/me"),
  forgotPassword: (email: string) => api.post<void>("/auth/forgot-password", { email }),
};
