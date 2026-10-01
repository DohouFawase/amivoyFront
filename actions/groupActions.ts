import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ApiErrorBody } from "@/interface/auth";
import type {
  CircleRecord,
  CreateCirclePayload,
  CreateInvitationPayload,
  CreateOutingPayload,
  InvitationRecord,
  OutingContributionPayload,
  OutingIdPayload,
  OutingPhotoPayload,
  OutingRecord,
  OutingRsvpPayload,
  RespondInvitationPayload,
  RespondInvitationByIdPayload,
  ToggleOutingStoryPayload,
  UpdateOutingPayload,
} from "@/interface/groups";
import type { ApiFailure } from "@/types/auth";
import { groupsService } from "@/services/groupsService";

interface GroupThunkConfig {
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

  return {
    message: error instanceof Error ? error.message : "Une erreur inattendue est survenue.",
  };
}

export const fetchCircles = createAsyncThunk<CircleRecord[], void, GroupThunkConfig>(
  "groups/fetchCircles",
  async (_, { rejectWithValue }) => {
    try {
      return await groupsService.fetchCircles();
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const createCircle = createAsyncThunk<CircleRecord, CreateCirclePayload, GroupThunkConfig>(
  "groups/createCircle",
  async (payload, { rejectWithValue }) => {
    try {
      return await groupsService.createCircle(payload);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const updateCircle = createAsyncThunk<CircleRecord, { id: string; changes: Partial<CreateCirclePayload> }, GroupThunkConfig>(
  "groups/updateCircle",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      return await groupsService.updateCircle(id, changes);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const deleteCircle = createAsyncThunk<string, string, GroupThunkConfig>(
  "groups/deleteCircle",
  async (id, { rejectWithValue }) => {
    try {
      await groupsService.deleteCircle(id);
      return id;
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const fetchInvitations = createAsyncThunk<InvitationRecord[], void, GroupThunkConfig>(
  "groups/fetchInvitations",
  async (_, { rejectWithValue }) => {
    try {
      return await groupsService.fetchInvitations();
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const createInvitation = createAsyncThunk<InvitationRecord, CreateInvitationPayload, GroupThunkConfig>(
  "groups/createInvitation",
  async (payload, { rejectWithValue }) => {
    try {
      return await groupsService.createInvitation(payload);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const respondInvitation = createAsyncThunk<InvitationRecord, RespondInvitationPayload, GroupThunkConfig>(
  "groups/respondInvitation",
  async (payload, { rejectWithValue }) => {
    try {
      return await groupsService.respondToInvitation(payload);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const respondInvitationById = createAsyncThunk<InvitationRecord, RespondInvitationByIdPayload, GroupThunkConfig>(
  "groups/respondInvitationById",
  async (payload, { rejectWithValue }) => {
    try {
      return await groupsService.respondToInvitationById(payload);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const fetchOutings = createAsyncThunk<OutingRecord[], void, GroupThunkConfig>(
  "groups/fetchOutings",
  async (_, { rejectWithValue }) => {
    try {
      return await groupsService.fetchOutings();
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const fetchOuting = createAsyncThunk<OutingRecord, string, GroupThunkConfig>(
  "groups/fetchOuting",
  async (id, { rejectWithValue }) => {
    try {
      return await groupsService.fetchOuting(id);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const createOuting = createAsyncThunk<OutingRecord, CreateOutingPayload, GroupThunkConfig>(
  "groups/createOuting",
  async (payload, { rejectWithValue }) => {
    try {
      return await groupsService.createOuting(payload);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const updateOuting = createAsyncThunk<OutingRecord, UpdateOutingPayload, GroupThunkConfig>(
  "groups/updateOuting",
  async (payload, { rejectWithValue }) => {
    try {
      return await groupsService.updateOuting(payload);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const respondToOuting = createAsyncThunk<OutingRecord, OutingRsvpPayload, GroupThunkConfig>(
  "groups/respondToOuting",
  async ({ id, attending }, { rejectWithValue }) => {
    try {
      return await groupsService.respondToOuting(id, attending);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const checkInToOuting = createAsyncThunk<OutingRecord, OutingIdPayload, GroupThunkConfig>(
  "groups/checkInToOuting",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await groupsService.checkInToOuting(id);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const startOuting = createAsyncThunk<OutingRecord, OutingIdPayload, GroupThunkConfig>(
  "groups/startOuting",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await groupsService.startOuting(id);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const finishOuting = createAsyncThunk<OutingRecord, OutingIdPayload, GroupThunkConfig>(
  "groups/finishOuting",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await groupsService.finishOuting(id);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const addOutingContribution = createAsyncThunk<OutingRecord, OutingContributionPayload, GroupThunkConfig>(
  "groups/addOutingContribution",
  async ({ id, amount }, { rejectWithValue }) => {
    try {
      return await groupsService.addContribution(id, amount);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const addOutingPhoto = createAsyncThunk<OutingRecord, OutingPhotoPayload, GroupThunkConfig>(
  "groups/addOutingPhoto",
  async ({ id, asset, caption }, { rejectWithValue }) => {
    try {
      await groupsService.addPhoto(id, asset, caption);
      return await groupsService.fetchOuting(id);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);

export const toggleOutingPhotoStory = createAsyncThunk<OutingRecord, ToggleOutingStoryPayload, GroupThunkConfig>(
  "groups/toggleOutingPhotoStory",
  async ({ id, photoId }, { rejectWithValue }) => {
    try {
      await groupsService.togglePhotoStory(id, photoId);
      return await groupsService.fetchOuting(id);
    } catch (error) {
      return rejectWithValue(toApiFailure(error));
    }
  },
);