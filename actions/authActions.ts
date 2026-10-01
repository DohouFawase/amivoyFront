import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ImagePickerAsset } from "expo-image-picker";
import type {
  ApiErrorBody,
  AuthSession,
  AuthMessageResponse,
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
import type { ApiFailure } from "@/types/auth";
import { authService } from "@/services/authService";
import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from "@/services/tokenStorage";

interface AuthThunkConfig {
  rejectValue: ApiFailure;
}

export type LoginResult =
  | { kind: "authenticated"; session: AuthTokenResponse }
  | { kind: "two_factor_required"; email: string; message: string };

function toApiFailure(error: unknown): ApiFailure {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    const fieldMessage = body?.errors
      ? Object.values(body.errors).flat()[0]
      : undefined;

    return {
      message:
        fieldMessage ?? body?.message ?? "La requête n’a pas abouti.",
      fieldErrors: body?.errors,
    };
  }

  return {
    message:
      error instanceof Error
        ? error.message
        : "Une erreur inattendue est survenue.",
  };
}

export const bootstrapAuth = createAsyncThunk<
  { user: AuthUser; accessToken: string } | null,
  void,
  AuthThunkConfig
>("auth/bootstrap", async (_, { rejectWithValue }) => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  try {
    return { user: await authService.fetchProfile(), accessToken };
  } catch {
    await clearAccessToken();
    return rejectWithValue({ message: "Ta session a expiré. Reconnecte-toi." });
  }
});

export const registerAccount = createAsyncThunk<
  AuthMessageResponse,
  RegisterPayload,
  AuthThunkConfig
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await authService.register(payload);
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const loginAccount = createAsyncThunk<
  LoginResult,
  LoginPayload,
  AuthThunkConfig
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.login(payload);

    if ("two_factor_required" in response && response.two_factor_required) {
      return {
        kind: "two_factor_required",
        email: payload.email,
        message: response.message,
      };
    }

    if (!("access_token" in response)) {
      return rejectWithValue({ message: "La réponse de connexion est invalide." });
    }

    await saveAccessToken(response.access_token);
    return { kind: "authenticated", session: response };
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const verifyEmailCode = createAsyncThunk<
  AuthTokenResponse,
  VerifyCodePayload,
  AuthThunkConfig
>("auth/verifyEmail", async (payload, { rejectWithValue }) => {
  try {
    const session = await authService.verifyEmail(payload);
    await saveAccessToken(session.access_token);
    return session;
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const resendVerificationCode = createAsyncThunk<
  AuthMessageResponse,
  string,
  AuthThunkConfig
>("auth/resendVerification", async (email, { rejectWithValue }) => {
  try {
    return await authService.resendVerificationCode(email);
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const verifyTwoFactorLogin = createAsyncThunk<
  AuthTokenResponse,
  VerifyCodePayload,
  AuthThunkConfig
>("auth/verifyTwoFactor", async (payload, { rejectWithValue }) => {
  try {
    const session = await authService.verifyTwoFactor(payload);
    await saveAccessToken(session.access_token);
    return session;
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const requestPasswordReset = createAsyncThunk<
  AuthMessageResponse,
  string,
  AuthThunkConfig
>("auth/requestPasswordReset", async (email, { rejectWithValue }) => {
  try {
    return await authService.requestPasswordReset(email);
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const resetPassword = createAsyncThunk<
  void,
  ResetPasswordPayload,
  AuthThunkConfig
>("auth/resetPassword", async (payload, { rejectWithValue }) => {
  try {
    await authService.resetPassword(payload);
    await clearAccessToken();
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const refreshSession = createAsyncThunk<
  string,
  void,
  AuthThunkConfig
>("auth/refresh", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.refresh();
    await saveAccessToken(response.access_token);
    return response.access_token;
  } catch (error) {
    await clearAccessToken();
    return rejectWithValue(toApiFailure(error));
  }
});

export const fetchProfile = createAsyncThunk<AuthUser, void, AuthThunkConfig>(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.fetchProfile();
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const fetchSessions = createAsyncThunk<AuthSession[], void, AuthThunkConfig>(
  "auth/fetchSessions",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.fetchSessions();
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const updateProfile = createAsyncThunk<
  AuthUser,
  ProfileUpdatePayload,
  AuthThunkConfig
>("auth/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    return await authService.updateProfile(payload);
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const uploadAvatar = createAsyncThunk<AuthUser, ImagePickerAsset, AuthThunkConfig>(
  "auth/uploadAvatar",
  async (asset, { rejectWithValue }) => {
    try {
      return await authService.uploadAvatar(asset);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const deleteAvatar = createAsyncThunk<AuthUser, void, AuthThunkConfig>(
  "auth/deleteAvatar",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.deleteAvatar();
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const changeEmail = createAsyncThunk<
  AuthMessageResponse,
  ChangeEmailPayload,
  AuthThunkConfig
>("auth/changeEmail", async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.changeEmail(payload);
    await clearAccessToken();
    return response;
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const changePassword = createAsyncThunk<
  void,
  ChangePasswordPayload,
  AuthThunkConfig
>("auth/changePassword", async (payload, { rejectWithValue }) => {
  try {
    await authService.changePassword(payload);
    await clearAccessToken();
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const enableTwoFactor = createAsyncThunk<
  AuthMessageResponse,
  CurrentPasswordPayload,
  AuthThunkConfig
>("auth/enableTwoFactor", async (payload, { rejectWithValue }) => {
  try {
    return await authService.enableTwoFactor(payload);
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const verifyTwoFactorEnable = createAsyncThunk<
  AuthMessageResponse,
  string,
  AuthThunkConfig
>("auth/verifyTwoFactorEnable", async (code, { rejectWithValue }) => {
  try {
    return await authService.verifyTwoFactorEnable(code);
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const disableTwoFactor = createAsyncThunk<
  AuthMessageResponse,
  CurrentPasswordPayload,
  AuthThunkConfig
>("auth/disableTwoFactor", async (payload, { rejectWithValue }) => {
  try {
    return await authService.disableTwoFactor(payload);
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const revokeOtherSessions = createAsyncThunk<
  number,
  void,
  AuthThunkConfig
>("auth/revokeOtherSessions", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.revokeOtherSessions();
    return response.revoked_sessions;
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});

export const logoutAccount = createAsyncThunk<void, void, AuthThunkConfig>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      const failure = toApiFailure(error);
      await clearAccessToken();
      return rejectWithValue(failure);
    }

    await clearAccessToken();
  },
);