import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { TripsState } from "@/types/trips";
import {
  createBudget,
  createBudgetLine,
  createDestinationProposal,
  createExclusionRequest,
  createTrip,
  createTripMember,
  deleteNotification,
  fetchBudgetLines,
  fetchBudgets,
  fetchDestinationProposals,
  fetchExchangeRates,
  fetchExclusionRequests,
  fetchGroupActivities,
  fetchNotifications,
  fetchNotificationPreferences,
  fetchTrip,
  fetchTripMembers,
  fetchTrips,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotificationPreferences,
  updateExclusionRequest,
} from "@/actions/tripActions";

const initialState: TripsState = {
  trips: [],
  activeTrip: null,
  members: [],
  budgets: [],
  budgetLines: [],
  destinationProposals: [],
  exclusionRequests: [],
  exchangeRates: [],
  groupActivities: [],
  notifications: [],
  notificationPreferences: [],
  requestStatus: "idle",
  error: null,
  notice: null,
};

function upsertTrip(state: TripsState, trip: TripsState["activeTrip"]): void {
  if (!trip) return;
  state.activeTrip = trip;
  const index = state.trips.findIndex((item) => item.id === trip.id);
  if (index === -1) state.trips.unshift(trip);
  else state.trips[index] = trip;
}

const tripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    clearTripFeedback(state) {
      state.error = null;
      state.notice = null;
      state.requestStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.trips = action.payload;
      })
      .addCase(fetchTrip.fulfilled, (state, action) => upsertTrip(state, action.payload))
      .addCase(createTrip.fulfilled, (state, action) => {
        upsertTrip(state, action.payload);
        state.notice = "Voyage créé.";
      })
      .addCase(fetchTripMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      })
      .addCase(createTripMember.fulfilled, (state, action) => {
        const index = state.members.findIndex((item) => item.id === action.payload.id);
        if (index === -1) state.members.push(action.payload);
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.budgets = action.payload;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.budgets.unshift(action.payload);
        state.notice = "Budget créé.";
      })
      .addCase(fetchBudgetLines.fulfilled, (state, action) => {
        state.budgetLines = action.payload;
      })
      .addCase(createBudgetLine.fulfilled, (state, action) => {
        state.budgetLines.unshift(action.payload);
        state.notice = "Ligne budgétaire ajoutée.";
      })
      .addCase(fetchDestinationProposals.fulfilled, (state, action) => {
        state.destinationProposals = action.payload;
      })
      .addCase(createDestinationProposal.fulfilled, (state, action) => {
        state.destinationProposals.unshift(action.payload);
        state.notice = "Proposition de destination ajoutée.";
      })
      .addCase(fetchExclusionRequests.fulfilled, (state, action) => {
        state.exclusionRequests = action.payload;
      })
      .addCase(createExclusionRequest.fulfilled, (state, action) => {
        state.exclusionRequests.unshift(action.payload);
        state.notice = "Demande envoyée aux organisateurs.";
      })
      .addCase(updateExclusionRequest.fulfilled, (state, action) => {
        const index = state.exclusionRequests.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.exclusionRequests[index] = action.payload;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.exchangeRates = action.payload;
      })
      .addCase(fetchGroupActivities.fulfilled, (state, action) => {
        state.groupActivities = action.payload;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.notifications[index] = action.payload;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((item) => ({ ...item, read: true }));
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter((item) => item.id !== action.payload);
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.notificationPreferences = action.payload;
      })
      .addCase(saveNotificationPreferences.fulfilled, (state, action) => {
        const index = state.notificationPreferences.findIndex((item) => item.id === action.payload.id);
        if (index === -1) state.notificationPreferences.push(action.payload);
        else state.notificationPreferences[index] = action.payload;
        state.notice = "Préférences de notification enregistrées.";
      })
      .addMatcher(
        isAnyOf(
          fetchTrips.pending, fetchTrip.pending, createTrip.pending, fetchTripMembers.pending,
          createTripMember.pending, fetchBudgets.pending, createBudget.pending,
          fetchBudgetLines.pending, createBudgetLine.pending, fetchDestinationProposals.pending,
          createDestinationProposal.pending, fetchExclusionRequests.pending,
          createExclusionRequest.pending, updateExclusionRequest.pending,
          fetchExchangeRates.pending, fetchGroupActivities.pending, fetchNotifications.pending,
          markNotificationRead.pending, markAllNotificationsRead.pending, deleteNotification.pending,
          fetchNotificationPreferences.pending, saveNotificationPreferences.pending,
        ),
        (state) => {
          state.requestStatus = "loading";
          state.error = null;
          state.notice = null;
        },
      )
      .addMatcher(
        isAnyOf(
          fetchTrips.rejected, fetchTrip.rejected, createTrip.rejected, fetchTripMembers.rejected,
          createTripMember.rejected, fetchBudgets.rejected, createBudget.rejected,
          fetchBudgetLines.rejected, createBudgetLine.rejected, fetchDestinationProposals.rejected,
          createDestinationProposal.rejected, fetchExclusionRequests.rejected,
          createExclusionRequest.rejected, updateExclusionRequest.rejected,
          fetchExchangeRates.rejected, fetchGroupActivities.rejected, fetchNotifications.rejected,
          markNotificationRead.rejected, markAllNotificationsRead.rejected, deleteNotification.rejected,
          fetchNotificationPreferences.rejected, saveNotificationPreferences.rejected,
        ),
        (state, action) => {
          state.requestStatus = "failed";
          state.error = action.payload?.message ?? action.error.message ?? "Une erreur est survenue.";
        },
      )
      .addMatcher(
        isAnyOf(
          fetchTrips.fulfilled, fetchTrip.fulfilled, createTrip.fulfilled, fetchTripMembers.fulfilled,
          createTripMember.fulfilled, fetchBudgets.fulfilled, createBudget.fulfilled,
          fetchBudgetLines.fulfilled, createBudgetLine.fulfilled, fetchDestinationProposals.fulfilled,
          createDestinationProposal.fulfilled, fetchExclusionRequests.fulfilled,
          createExclusionRequest.fulfilled, updateExclusionRequest.fulfilled,
          fetchExchangeRates.fulfilled, fetchGroupActivities.fulfilled, fetchNotifications.fulfilled,
          markNotificationRead.fulfilled, markAllNotificationsRead.fulfilled, deleteNotification.fulfilled,
          fetchNotificationPreferences.fulfilled, saveNotificationPreferences.fulfilled,
        ),
        (state) => {
          state.requestStatus = "succeeded";
          state.error = null;
        },
      );
  },
});

export const { clearTripFeedback } = tripsSlice.actions;
export default tripsSlice.reducer;