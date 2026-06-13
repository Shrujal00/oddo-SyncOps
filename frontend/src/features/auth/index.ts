import { api } from "../../services/api-client";
import type { AuthUser } from "../../store/app-store";

export interface LoginPayload { email: string; password: string; }
export interface LoginResponse { accessToken: string; user: AuthUser; }

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/auth/login", payload),
};

export type AuthFeatureStatus = "idle" | "authenticated" | "unauthenticated";
