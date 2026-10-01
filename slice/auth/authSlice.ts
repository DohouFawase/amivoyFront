import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { AuthState } from "@/types/auth";
import {
  bootstrapAuth,
  changeEmail,
  changePassword,
  deleteAvatar,
  disableTwoFactor,
  enableTwoFactor,
  fetchProfile,
  fetchSessions,
  loginAccount,
  logoutAccount,
  refreshSession,
  registerAccount,
  requestPasswordReset,
  resendVerificationCode,
  resetPassword,
  revokeOtherSessions,
  updateProfile,
  uploadAvatar,
  verifyEmailCode,
  verifyTwoFactorEnable,
  verifyTwoFactorLogin,
} from "@/actions/authActions";

const initialState: AuthState = {
  user: null,
  sessions: [],
  accessToken: null,
  isBootstrapping: true,
  requestStatus: "idle",
  error: null,
  notice: null,
  pendingVerificationEmail: null,
  pendingTwoFactorEmail: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthFeedback(state) {
      state.error = null;
      state.notice = null;
      state.requestStatus = "idle";
    },
    clearPendingTwoFactor(state) {
      state.pendingTwoFactorEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.isBootstrapping = true;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.isBootstrapping = false;
        state.user = action.payload?.user ?? null;
        state.accessToken = action.payload?.accessToken ?? null;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.isBootstrapping = false;
        state.user = null;
        state.accessToken = null;
      })
      .addCase(registerAccount.fulfilled, (state, action) => {
        state.pendingVerificationEmail = action.meta.arg.email;
        state.notice = action.payload.message;
      })
      .addCase(resendVerificationCode.fulfilled, (state, action) => {
        state.notice = action.payload.message;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.notice = action.payload.message;
      })
      .addCase(loginAccount.fulfilled, (state, action) => {
        if (action.payload.kind === "two_factor_required") {
          state.pendingTwoFactorEmail = action.payload.email;
          state.notice = action.payload.message;
          return;
        }

        state.user = action.payload.session.data;
        state.accessToken = action.payload.session.access_token;
        state.pendingTwoFactorEmail = null;
      })
      .addCase(verifyEmailCode.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.accessToken = action.payload.access_token;
        state.pendingVerificationEmail = null;
      })
      .addCase(verifyTwoFactorLogin.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.accessToken = action.payload.access_token;
        state.pendingTwoFactorEmail = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessions = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.notice = "Ton profil a été mis à jour.";
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
        state.notice = "Ta photo de profil a été mise à jour.";
      })
      .addCase(deleteAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
        state.notice = "Ta photo de profil a été supprimée.";
      })
      .addCase(changeEmail.fulfilled, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.pendingVerificationEmail = action.meta.arg.email;
        state.notice = action.payload.message;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.notice = "Mot de passe modifié. Reconnecte-toi.";
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.notice = "Mot de passe réinitialisé. Tu peux te connecter.";
      })
      .addCase(enableTwoFactor.fulfilled, (state, action) => {
        state.notice = action.payload.message;
      })
      .addCase(verifyTwoFactorEnable.fulfilled, (state, action) => {
        if (state.user) {
          state.user.two_factor_enabled = true;
        }
        state.notice = action.payload.message;
      })
      .addCase(disableTwoFactor.fulfilled, (state, action) => {
        if (state.user) {
          state.user.two_factor_enabled = false;
        }
        state.notice = action.payload.message;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })
      .addCase(revokeOtherSessions.fulfilled, (state, action) => {
        state.notice = `${action.payload} autre(s) session(s) fermée(s).`;
      })
      .addCase(logoutAccount.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.pendingTwoFactorEmail = null;
        state.pendingVerificationEmail = null;
        state.requestStatus = "idle";
      })
      .addCase(logoutAccount.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.pendingTwoFactorEmail = null;
        state.pendingVerificationEmail = null;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
      })
      .addMatcher(
        isAnyOf(
          registerAccount.pending,
          loginAccount.pending,
          verifyEmailCode.pending,
          resendVerificationCode.pending,
          verifyTwoFactorLogin.pending,
          requestPasswordReset.pending,
          resetPassword.pending,
          refreshSession.pending,
          fetchProfile.pending,
          fetchSessions.pending,
          updateProfile.pending,
          uploadAvatar.pending,
          deleteAvatar.pending,
          changeEmail.pending,
          changePassword.pending,
          enableTwoFactor.pending,
          verifyTwoFactorEnable.pending,
          disableTwoFactor.pending,
          revokeOtherSessions.pending,
          logoutAccount.pending,
        ),
        (state) => {
          state.requestStatus = "loading";
          state.error = null;
          state.notice = null;
        },
      )
      .addMatcher(
        isAnyOf(
          registerAccount.rejected,
          loginAccount.rejected,
          verifyEmailCode.rejected,
          resendVerificationCode.rejected,
          verifyTwoFactorLogin.rejected,
          requestPasswordReset.rejected,
          resetPassword.rejected,
          refreshSession.rejected,
          fetchProfile.rejected,
          fetchSessions.rejected,
          updateProfile.rejected,
          uploadAvatar.rejected,
          deleteAvatar.rejected,
          changeEmail.rejected,
          changePassword.rejected,
          enableTwoFactor.rejected,
          verifyTwoFactorEnable.rejected,
          disableTwoFactor.rejected,
          revokeOtherSessions.rejected,
          logoutAccount.rejected,
        ),
        (state, action) => {
          state.requestStatus = "failed";
          state.error = action.payload?.message ?? action.error.message ?? "Une erreur est survenue.";
        },
      )
      .addMatcher(
        isAnyOf(
          registerAccount.fulfilled,
          loginAccount.fulfilled,
          verifyEmailCode.fulfilled,
          resendVerificationCode.fulfilled,
          verifyTwoFactorLogin.fulfilled,
          requestPasswordReset.fulfilled,
          resetPassword.fulfilled,
          refreshSession.fulfilled,
          fetchProfile.fulfilled,
          fetchSessions.fulfilled,
          updateProfile.fulfilled,
          uploadAvatar.fulfilled,
          deleteAvatar.fulfilled,
          changeEmail.fulfilled,
          changePassword.fulfilled,
          enableTwoFactor.fulfilled,
          verifyTwoFactorEnable.fulfilled,
          disableTwoFactor.fulfilled,
          revokeOtherSessions.fulfilled,
          logoutAccount.fulfilled,
        ),
        (state) => {
          state.requestStatus = "succeeded";
          state.error = null;
        },
      );
  },
});

export const { clearAuthFeedback, clearPendingTwoFactor } = authSlice.actions;
export default authSlice.reducer;