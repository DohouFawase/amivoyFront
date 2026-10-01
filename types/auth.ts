import type { AuthSession, AuthUser } from "@/interface/auth";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AuthState {
  user: AuthUser | null;
  sessions: AuthSession[];
  accessToken: string | null;
  isBootstrapping: boolean;
  requestStatus: RequestStatus;
  error: string | null;
  notice: string | null;
  pendingVerificationEmail: string | null;
  pendingTwoFactorEmail: string | null;
}

export interface ApiFailure {
  message: string;
  fieldErrors?: Record<string, string[]>;
}