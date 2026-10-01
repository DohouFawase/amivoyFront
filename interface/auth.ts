export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  language: "fr" | "en";
  country: string | null;
  interests: string[];
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  status: string;
  platform_role?: string;
  created_at: string;
}

export interface AuthSession {
  id: string;
  device_name: string;
  ip_address: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface AuthTokenResponse {
  data: AuthUser;
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
}

export interface AuthRefreshResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
}

export interface AuthMessageResponse {
  message: string;
  email_verification_required?: boolean;
  two_factor_required?: boolean;
  data?: AuthUser;
}

export interface RegisterPayload {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  device_name?: string;
}

export interface VerifyCodePayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload extends VerifyCodePayload {
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string | null;
  phone?: string | null;
  language?: "fr" | "en";
  country?: string | null;
  interests?: string[];
}

export interface ChangeEmailPayload {
  email: string;
  current_password: string;
}

export interface CurrentPasswordPayload {
  current_password: string;
}

export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}