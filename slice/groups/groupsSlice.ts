import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { GroupsState } from "@/types/groups";
import {
  addOutingContribution,
  addOutingPhoto,
  checkInToOuting,
  createCircle,
  createInvitation,
  createOuting,
  deleteCircle,
  fetchCircles,
  fetchInvitations,
  fetchOuting,
  fetchOutings,
  finishOuting,
  respondInvitation,
  respondInvitationById,
  respondToOuting,
  startOuting,
  toggleOutingPhotoStory,
  updateCircle,
  updateOuting,
} from "@/actions/groupActions";

const initialState: GroupsState = {
  circles: [],
  outings: [],
  activeOuting: null,
  invitations: [],
  requestStatus: "idle",
  error: null,
  notice: null,
};

function upsertOuting(state: GroupsState, outing: GroupsState["activeOuting"]): void {
  if (!outing) return;
  state.activeOuting = outing;
  const index = state.outings.findIndex((item) => item.id === outing.id);
  if (index === -1) {
    state.outings.unshift(outing);
  } else {
    state.outings[index] = outing;
  }
}

const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    clearGroupFeedback(state) {
      state.error = null;
      state.notice = null;
      state.requestStatus = "idle";
    },
    clearActiveOuting(state) {
      state.activeOuting = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCircles.fulfilled, (state, action) => {
        state.circles = action.payload;
      })
      .addCase(createCircle.fulfilled, (state, action) => {
        state.circles.unshift(action.payload);
        state.notice = `Le cercle « ${action.payload.name} » a été créé.`;
      })
      .addCase(updateCircle.fulfilled, (state, action) => {
        const index = state.circles.findIndex((circle) => circle.id === action.payload.id);
        if (index !== -1) state.circles[index] = action.payload;
        state.notice = "Le cercle a été mis à jour.";
      })
      .addCase(deleteCircle.fulfilled, (state, action) => {
        state.circles = state.circles.filter((circle) => circle.id !== action.payload);
        state.invitations = state.invitations.filter((invitation) => invitation.circle_id !== action.payload);
        state.notice = "Le cercle a été supprimé.";
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.invitations = action.payload;
      })
      .addCase(createInvitation.fulfilled, (state, action) => {
        state.invitations.unshift(action.payload);
        state.notice = "Invitation créée. Partage le lien avec la personne invitée.";
      })
      .addCase(respondInvitation.fulfilled, (state, action) => {
        const index = state.invitations.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.invitations[index] = action.payload;
        state.notice = action.payload.statusCode === "accepted" ? "Invitation acceptée." : "Invitation refusée.";
      })
      .addCase(respondInvitationById.fulfilled, (state, action) => {
        const index = state.invitations.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.invitations[index] = action.payload;
        state.notice = action.payload.statusCode === "accepted" ? "Invitation acceptée." : "Invitation refusée.";
      })
      .addCase(fetchOutings.fulfilled, (state, action) => {
        state.outings = action.payload;
      })
      .addCase(fetchOuting.fulfilled, (state, action) => {
        upsertOuting(state, action.payload);
      })
      .addCase(createOuting.fulfilled, (state, action) => {
        upsertOuting(state, action.payload);
        state.notice = "La sortie a été créée.";
      })
      .addCase(updateOuting.fulfilled, (state, action) => {
        upsertOuting(state, action.payload);
        state.notice = "Le programme de la sortie a été mis à jour.";
      })
      .addCase(respondToOuting.fulfilled, (state, action) => upsertOuting(state, action.payload))
      .addCase(checkInToOuting.fulfilled, (state, action) => upsertOuting(state, action.payload))
      .addCase(startOuting.fulfilled, (state, action) => {
        upsertOuting(state, action.payload);
        state.notice = "La sortie a commencé.";
      })
      .addCase(finishOuting.fulfilled, (state, action) => {
        upsertOuting(state, action.payload);
        state.notice = "La sortie est terminée.";
      })
      .addCase(addOutingContribution.fulfilled, (state, action) => {
        upsertOuting(state, action.payload);
        state.notice = "Cotisation enregistrée.";
      })
      .addCase(addOutingPhoto.fulfilled, (state, action) => {
        upsertOuting(state, action.payload);
        state.notice = "Photo ajoutée au carnet de la sortie.";
      })
      .addCase(toggleOutingPhotoStory.fulfilled, (state, action) => {
        upsertOuting(state, action.payload);
        state.notice = "Partage Story mis à jour.";
      })
      .addMatcher(
        isAnyOf(
          fetchCircles.pending,
          createCircle.pending,
          updateCircle.pending,
          deleteCircle.pending,
          fetchInvitations.pending,
          createInvitation.pending,
          respondInvitation.pending,
          respondInvitationById.pending,
          fetchOutings.pending,
          fetchOuting.pending,
          createOuting.pending,
          updateOuting.pending,
          respondToOuting.pending,
          checkInToOuting.pending,
          startOuting.pending,
          finishOuting.pending,
          addOutingContribution.pending,
          addOutingPhoto.pending,
          toggleOutingPhotoStory.pending,
        ),
        (state) => {
          state.requestStatus = "loading";
          state.error = null;
          state.notice = null;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchCircles.rejected,
          createCircle.rejected,
          updateCircle.rejected,
          deleteCircle.rejected,
          fetchInvitations.rejected,
          createInvitation.rejected,
          respondInvitation.rejected,
          respondInvitationById.rejected,
          fetchOutings.rejected,
          fetchOuting.rejected,
          createOuting.rejected,
          updateOuting.rejected,
          respondToOuting.rejected,
          checkInToOuting.rejected,
          startOuting.rejected,
          finishOuting.rejected,
          addOutingContribution.rejected,
          addOutingPhoto.rejected,
          toggleOutingPhotoStory.rejected,
        ),
        (state, action) => {
          state.requestStatus = "failed";
          state.error = action.payload?.message ?? action.error.message ?? "Une erreur est survenue.";
        },
      )
      .addMatcher(
        isAnyOf(
          fetchCircles.fulfilled,
          createCircle.fulfilled,
          updateCircle.fulfilled,
          deleteCircle.fulfilled,
          fetchInvitations.fulfilled,
          createInvitation.fulfilled,
          respondInvitation.fulfilled,
          respondInvitationById.fulfilled,
          fetchOutings.fulfilled,
          fetchOuting.fulfilled,
          createOuting.fulfilled,
          updateOuting.fulfilled,
          respondToOuting.fulfilled,
          checkInToOuting.fulfilled,
          startOuting.fulfilled,
          finishOuting.fulfilled,
          addOutingContribution.fulfilled,
          addOutingPhoto.fulfilled,
          toggleOutingPhotoStory.fulfilled,
        ),
        (state) => {
          state.requestStatus = "succeeded";
          state.error = null;
        },
      );
  },
});

export const { clearGroupFeedback, clearActiveOuting } = groupSlice.actions;
export default groupSlice.reducer;