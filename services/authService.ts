import type {
  ApiEnvelope,
  AuthSession,
  AuthMessageResponse,
  AuthRefreshResponse,
  AuthTokenResponse,
  AuthUser,
  ChangeEmailPayload,
  ChangePasswordPayload,
  CurrentPasswordPayload,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyCodePayload,
} from "@/interface/auth";
import type { ImagePickerAsset } from "expo-image-picker";
import { Platform } from "react-native";
import { apiClient } from "@/services/apiClient";

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthMessageResponse> {
    const response = await apiClient.post<AuthMessageResponse>(
      "/auth/register",
      payload,
    );
    return response.data;
  },

  async login(
    payload: LoginPayload,
  ): Promise<AuthTokenResponse | AuthMessageResponse> {
    const response = await apiClient.post<
      AuthTokenResponse | AuthMessageResponse
    >("/auth/login", payload);
    return response.data;
  },

  async verifyEmail(payload: VerifyCodePayload): Promise<AuthTokenResponse> {
    const response = await apiClient.post<AuthTokenResponse>(
      "/auth/email/verification/verify",
      payload,
    );
    return response.data;
  },

  async resendVerificationCode(email: string): Promise<AuthMessageResponse> {
    const response = await apiClient.post<AuthMessageResponse>(
      "/auth/email/verification/send",
      { email },
    );
    return response.data;
  },

  async verifyTwoFactor(
    payload: VerifyCodePayload,
  ): Promise<AuthTokenResponse> {
    const response = await apiClient.post<AuthTokenResponse>(
      "/auth/two-factor/verify",
      payload,
    );
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<AuthMessageResponse> {
    const response = await apiClient.post<AuthMessageResponse>(
      "/auth/password/forgot",
      { email },
    );
    return response.data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await apiClient.post("/auth/password/reset", payload);
  },

  async refresh(): Promise<AuthRefreshResponse> {
    const response = await apiClient.post<AuthRefreshResponse>("/auth/refresh");
    return response.data;
  },

  async fetchProfile(): Promise<AuthUser> {
    const response = await apiClient.get<ApiEnvelope<AuthUser>>("/me");
    return response.data.data;
  },

  async fetchSessions(): Promise<AuthSession[]> {
    const response = await apiClient.get<ApiEnvelope<AuthSession[]>>("/me/sessions");
    return response.data.data;
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<AuthUser> {
    const response = await apiClient.patch<ApiEnvelope<AuthUser>>(
      "/me",
      payload,
    );
    return response.data.data;
  },

  async uploadAvatar(asset: ImagePickerAsset): Promise<AuthUser> {
    const formData = new FormData();

    if (Platform.OS === "web" && asset.file) {
      formData.append("avatar", asset.file);
    } else {
      formData.append(
        "avatar",
        {
          uri: asset.uri,
          name: asset.fileName ?? "avatar.jpg",
          type: asset.mimeType ?? "image/jpeg",
        } as unknown as Blob,
      );
    }

    const response = await apiClient.post<ApiEnvelope<AuthUser>>(
      "/me/avatar",
      formData,
    );
    return response.data.data;
  },

  async deleteAvatar(): Promise<AuthUser> {
    const response = await apiClient.delete<ApiEnvelope<AuthUser>>("/me/avatar");
    return response.data.data;
  },

  async changeEmail(payload: ChangeEmailPayload): Promise<AuthMessageResponse> {
    const response = await apiClient.put<AuthMessageResponse>(
      "/me/email",
      payload,
    );
    return response.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.put("/auth/password", payload);
  },

  async logout(): Promise<void> {
    await apiClient.delete("/auth/logout");
  },

  async enableTwoFactor(
    payload: CurrentPasswordPayload,
  ): Promise<AuthMessageResponse> {
    const response = await apiClient.post<AuthMessageResponse>(
      "/auth/two-factor/enable",
      payload,
    );
    return response.data;
  },

  async verifyTwoFactorEnable(code: string): Promise<AuthMessageResponse> {
    const response = await apiClient.post<AuthMessageResponse>(
      "/auth/two-factor/enable/verify",
      { code },
    );
    return response.data;
  },

  async disableTwoFactor(
    payload: CurrentPasswordPayload,
  ): Promise<AuthMessageResponse> {
    const response = await apiClient.delete<AuthMessageResponse>(
      "/auth/two-factor",
      { data: payload },
    );
    return response.data;
  },

  async revokeOtherSessions(): Promise<{ revoked_sessions: number }> {
    const response = await apiClient.post<{ revoked_sessions: number }>(
      "/me/sessions/revoke-others",
    );
    return response.data;
  },
};