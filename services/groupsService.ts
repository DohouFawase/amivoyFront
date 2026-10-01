import { Platform } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";
import type { ApiEnvelope } from "@/interface/auth";
import type {
  CircleRecord,
  CreateCirclePayload,
  CreateInvitationPayload,
  CreateOutingPayload,
  InvitationRecord,
  OutingContributionRecord,
  OutingPhotoRecord,
  OutingRecord,
  RespondInvitationPayload,
  RespondInvitationByIdPayload,
  UpdateOutingPayload,
} from "@/interface/groups";
import { apiClient } from "@/services/apiClient";

interface ApiCollection<T> {
  data: T[];
}

export const groupsService = {
  async fetchCircles(): Promise<CircleRecord[]> {
    const response = await apiClient.get<ApiCollection<CircleRecord>>("/circles");
    return response.data.data;
  },

  async fetchCircle(id: string): Promise<CircleRecord> {
    const response = await apiClient.get<ApiEnvelope<CircleRecord>>(`/circles/${id}`);
    return response.data.data;
  },

  async createCircle(payload: CreateCirclePayload): Promise<CircleRecord> {
    const response = await apiClient.post<ApiEnvelope<CircleRecord>>(
      "/circles",
      payload,
    );
    return response.data.data;
  },

  async updateCircle(
    id: string,
    payload: Partial<CreateCirclePayload>,
  ): Promise<CircleRecord> {
    const response = await apiClient.put<ApiEnvelope<CircleRecord>>(
      `/circles/${id}`,
      payload,
    );
    return response.data.data;
  },

  async deleteCircle(id: string): Promise<void> {
    await apiClient.delete(`/circles/${id}`);
  },

  async fetchInvitations(): Promise<InvitationRecord[]> {
    const response = await apiClient.get<ApiCollection<InvitationRecord>>(
      "/invitations",
    );
    return response.data.data;
  },

  async createInvitation(
    payload: CreateInvitationPayload,
  ): Promise<InvitationRecord> {
    const response = await apiClient.post<ApiEnvelope<InvitationRecord>>(
      "/invitations",
      payload,
    );
    return response.data.data;
  },

  async fetchInvitation(id: string): Promise<InvitationRecord> { const r = await apiClient.get<ApiEnvelope<InvitationRecord>>(`/invitations/${id}`); return r.data.data; },
  async updateInvitation(id: string, payload: Partial<Pick<InvitationRecord, "channel" | "target" | "expires_at">>): Promise<InvitationRecord> { const r = await apiClient.patch<ApiEnvelope<InvitationRecord>>(`/invitations/${id}`, payload); return r.data.data; },
  async deleteInvitation(id: string): Promise<void> { await apiClient.delete(`/invitations/${id}`); },

  async respondToInvitation(
    payload: RespondInvitationPayload,
  ): Promise<InvitationRecord> {
    const response = await apiClient.post<ApiEnvelope<InvitationRecord>>(
      "/invitations/respond",
      payload,
    );
    return response.data.data;
  },

  async respondToInvitationById(
    payload: RespondInvitationByIdPayload,
  ): Promise<InvitationRecord> {
    const response = await apiClient.post<ApiEnvelope<InvitationRecord>>(
      `/invitations/${payload.id}/respond`,
      { status: payload.status },
    );
    return response.data.data;
  },

  async fetchOutings(): Promise<OutingRecord[]> {
    const response = await apiClient.get<ApiCollection<OutingRecord>>("/outings");
    return response.data.data;
  },

  async fetchOuting(id: string): Promise<OutingRecord> {
    const response = await apiClient.get<ApiEnvelope<OutingRecord>>(
      `/outings/${id}`,
    );
    return response.data.data;
  },

  async createOuting(payload: CreateOutingPayload): Promise<OutingRecord> {
    const response = await apiClient.post<ApiEnvelope<OutingRecord>>(
      "/outings",
      payload,
    );
    return response.data.data;
  },

  async deleteOuting(id: string): Promise<void> { await apiClient.delete(`/outings/${id}`); },

  async updateOuting({ id, changes }: UpdateOutingPayload): Promise<OutingRecord> {
    const response = await apiClient.patch<ApiEnvelope<OutingRecord>>(
      `/outings/${id}`,
      changes,
    );
    return response.data.data;
  },

  async respondToOuting(id: string, attending: boolean): Promise<OutingRecord> {
    const response = await apiClient.post<ApiEnvelope<OutingRecord>>(
      `/outings/${id}/rsvp`,
      { attending },
    );
    return response.data.data;
  },

  async checkInToOuting(id: string): Promise<OutingRecord> {
    const response = await apiClient.post<ApiEnvelope<OutingRecord>>(
      `/outings/${id}/check-in`,
    );
    return response.data.data;
  },

  async startOuting(id: string): Promise<OutingRecord> {
    const response = await apiClient.post<ApiEnvelope<OutingRecord>>(
      `/outings/${id}/start`,
    );
    return response.data.data;
  },

  async finishOuting(id: string): Promise<OutingRecord> {
    const response = await apiClient.post<ApiEnvelope<OutingRecord>>(
      `/outings/${id}/finish`,
    );
    return response.data.data;
  },

  async addContribution(
    id: string,
    amount: number,
  ): Promise<OutingRecord> {
    const response = await apiClient.post<ApiEnvelope<OutingRecord>>(
      `/outings/${id}/contributions`,
      { amount },
    );
    return response.data.data;
  },

  async addPhoto(
    id: string,
    asset: ImagePickerAsset,
    caption?: string,
  ): Promise<OutingPhotoRecord> {
    const formData = new FormData();

    if (Platform.OS === "web" && asset.file) {
      formData.append("image", asset.file);
    } else {
      formData.append(
        "image",
        {
          uri: asset.uri,
          name: asset.fileName ?? "outing-photo.jpg",
          type: asset.mimeType ?? "image/jpeg",
        } as unknown as Blob,
      );
    }

    if (caption) formData.append("caption", caption);

    const response = await apiClient.post<ApiEnvelope<OutingPhotoRecord>>(
      `/outings/${id}/photos`,
      formData,
    );
    return response.data.data;
  },

  async togglePhotoStory(
    id: string,
    photoId: string,
  ): Promise<OutingPhotoRecord> {
    const response = await apiClient.patch<ApiEnvelope<OutingPhotoRecord>>(
      `/outings/${id}/photos/${photoId}/story`,
    );
    return response.data.data;
  },

};