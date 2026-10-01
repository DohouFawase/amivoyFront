import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ApiErrorBody } from "@/interface/auth";
import type {
  AppNotificationRecord,
  BudgetLineRecord,
  BudgetRecord,
  CreateBudgetLinePayload,
  CreateBudgetPayload,
  CreateDestinationProposalPayload,
  CreateExclusionRequestPayload,
  CreateTripMemberPayload,
  CreateTripPayload,
  DestinationProposalRecord,
  ExchangeRateRecord,
  ExclusionRequestRecord,
  GroupActivityRecord,
  NotificationPreferenceRecord,
  TripMemberRecord,
  TripRecord,
  UpdateExclusionRequestPayload,
  UpdateNotificationPreferencePayload,
} from "@/interface/trips";
import type { RootState } from "@/stores/store";
import type { ApiFailure } from "@/types/auth";
import { groupsService } from "@/services/groupsService";
import { tripsService } from "@/services/tripsService";

interface TripThunkConfig {
  rejectValue: ApiFailure;
}

function toApiFailure(error: unknown): ApiFailure {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    const fieldMessage = body?.errors ? Object.values(body.errors).flat()[0] : undefined;
    return {
      message: fieldMessage ?? body?.message ?? "La requête n’a pas abouti.",
      fieldErrors: body?.errors,
    };
  }
  return { message: error instanceof Error ? error.message : "Une erreur inattendue est survenue." };
}

function apiThunk<Returned, Argument = void>(
  type: string,
  request: (argument: Argument) => Promise<Returned>,
) {
  return createAsyncThunk<Returned, Argument, TripThunkConfig>(
    type,
    async (argument, { rejectWithValue }) => {
      try {
        return await request(argument);
      } catch (error) {
        return rejectWithValue(toApiFailure(error));
      }
    },
  );
}

export const fetchTrips = apiThunk<TripRecord[]>("trips/fetch", () => tripsService.fetchTrips());
export const fetchTrip = apiThunk<TripRecord, string>("trips/fetchOne", (id) => tripsService.fetchTrip(id));
export const createTripMember = apiThunk<TripMemberRecord, CreateTripMemberPayload>("trips/createMember", (payload) => tripsService.createTripMember(payload));
export const fetchTripMembers = apiThunk<TripMemberRecord[]>("trips/fetchMembers", () => tripsService.fetchTripMembers());

export const createTrip = createAsyncThunk<TripRecord, CreateTripPayload, TripThunkConfig>(
  "trips/create",
  async (payload, { rejectWithValue, getState, dispatch }) => {
    try {
      const trip = await tripsService.createTrip(payload);
      const user = (getState() as RootState).auth.user;
      if (user) {
        try {
          await dispatch(createTripMember({
            trip_id: trip.id,
            user_id: user.id,
            role: "organizer",
            status: "active",
          })).unwrap();
        } catch {
          // Trip creation remains successful if membership bookkeeping fails.
        }

        if (payload.circle_id) {
          try {
            const circle = (await groupsService.fetchCircles()).find(
              (item) => item.id === payload.circle_id,
            );
            const memberIds = (circle?.member_user_ids ?? []).filter(
              (memberId) => memberId !== user.id,
            );
            await Promise.all(memberIds.map((memberId) =>
              dispatch(createTripMember({
                trip_id: trip.id,
                user_id: memberId,
                role: "member",
                status: "active",
              })).unwrap().catch(() => undefined),
            ));
          } catch {
            // A trip can still be created when circle memberships need manual resolution.
          }
        }
      }
      return trip;
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const fetchBudgets = apiThunk<BudgetRecord[]>("trips/fetchBudgets", () => tripsService.fetchBudgets());
export const createBudget = apiThunk<BudgetRecord, CreateBudgetPayload>("trips/createBudget", (payload) => tripsService.createBudget(payload));
export const fetchBudgetLines = apiThunk<BudgetLineRecord[]>("trips/fetchBudgetLines", () => tripsService.fetchBudgetLines());
export const createBudgetLine = apiThunk<BudgetLineRecord, CreateBudgetLinePayload>("trips/createBudgetLine", (payload) => tripsService.createBudgetLine(payload));
export const fetchDestinationProposals = apiThunk<DestinationProposalRecord[]>("trips/fetchProposals", () => tripsService.fetchDestinationProposals());
export const createDestinationProposal = apiThunk<DestinationProposalRecord, CreateDestinationProposalPayload>("trips/createProposal", (payload) => tripsService.createDestinationProposal(payload));
export const fetchExclusionRequests = apiThunk<ExclusionRequestRecord[]>("trips/fetchExclusions", () => tripsService.fetchExclusionRequests());
export const createExclusionRequest = apiThunk<ExclusionRequestRecord, CreateExclusionRequestPayload>("trips/createExclusionRequest", (payload) => tripsService.createExclusionRequest(payload));
export const updateExclusionRequest = apiThunk<ExclusionRequestRecord, UpdateExclusionRequestPayload>("trips/updateExclusionRequest", (payload) => tripsService.updateExclusionRequest(payload));
export const fetchExchangeRates = apiThunk<ExchangeRateRecord[]>("trips/fetchExchangeRates", () => tripsService.fetchExchangeRates());
export const fetchGroupActivities = apiThunk<GroupActivityRecord[]>("trips/fetchGroupActivities", () => tripsService.fetchGroupActivities());
export const fetchNotifications = apiThunk<AppNotificationRecord[]>("trips/fetchNotifications", () => tripsService.fetchNotifications());
export const markNotificationRead = apiThunk<AppNotificationRecord, string>("trips/markNotificationRead", (id) => tripsService.markNotificationRead(id));
export const markAllNotificationsRead = apiThunk<void>("trips/markAllNotificationsRead", () => tripsService.markAllNotificationsRead());
export const deleteNotification = apiThunk<string, string>("trips/deleteNotification", async (id) => {
  await tripsService.deleteNotification(id);
  return id;
});
export const fetchNotificationPreferences = apiThunk<NotificationPreferenceRecord[]>("trips/fetchNotificationPreferences", () => tripsService.fetchNotificationPreferences());

export const saveNotificationPreferences = createAsyncThunk<
  NotificationPreferenceRecord,
  UpdateNotificationPreferencePayload & { user_id: string },
  TripThunkConfig
>("trips/saveNotificationPreferences", async (payload, { rejectWithValue }) => {
  try {
    const existing = await tripsService.fetchNotificationPreferences();
    const owned = existing.find((item) => item.user_id === payload.user_id);
    return owned
      ? await tripsService.updateNotificationPreferences({ ...payload, id: owned.id })
      : await tripsService.createNotificationPreferences(payload);
  } catch (error) {
    return rejectWithValue(toApiFailure(error));
  }
});