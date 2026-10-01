import { Platform } from "react-native";
import type { ApiEnvelope } from "@/interface/auth";
import type {
  AppNotificationRecord,
  BudgetLineRecord,
  BudgetRecord,
  BookingRecord,
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
  NearbyPlaceSuggestion,
  PlaceSearchRecord,
  TripMemberRecord,
  TripNotificationResult,
  TripRecord,
  UpdateExclusionRequestPayload,
  UpdateNotificationPreferencePayload,
  ActivityRecord,
  ActivityAttendeeRecord,
  ContributionRecord,
  PackingItemRecord,
  PollAnswerRecord,
  PollOptionRecord,
  PollRecord,
  PublicTripRecord,
  RoutePlanResponse,
  RouteSuggestionRecord,
  ServiceRecord,
  TripJournalEntryRecord,
  TripPhotoRecord,
  TripPlaceRecord,
  EmergencyAlertRecord,
  EmergencyAlertRecipientRecord,
  DeviceTokenRecord,
  ExpenseRecord, ExpenseParticipantRecord, LocationShareRecord, LocationPointRecord, MeetingPointRecord, ModerationActionRecord, OfflineSyncQueueRecord, PartnerRecord, PhotoCommentRecord,
} from "@/interface/trips";
import { apiClient } from "@/services/apiClient";

interface ApiCollection<T> {
  data: T[];
}

export const tripsService = {
  async fetchPackingItem(id: string): Promise<PackingItemRecord> { const r = await apiClient.get<ApiEnvelope<PackingItemRecord>>(`/packing-items/${id}`); return r.data.data; },

  async fetchPackingItems(tripId: string): Promise<PackingItemRecord[]> {
    const response = await apiClient.get<ApiCollection<PackingItemRecord>>("/packing-items");
    return response.data.data.filter((item) => item.trip_id === tripId);
  },

  async createPackingItem(payload: { trip_id: string; title: string; category?: string; quantity?: number }): Promise<PackingItemRecord> {
    const response = await apiClient.post<ApiEnvelope<PackingItemRecord>>("/packing-items", payload);
    return response.data.data;
  },

  async updatePackingItem(id: string, changes: Partial<Pick<PackingItemRecord, "title" | "category" | "quantity" | "is_packed" | "notes">>): Promise<PackingItemRecord> {
    const response = await apiClient.patch<ApiEnvelope<PackingItemRecord>>(`/packing-items/${id}`, changes);
    return response.data.data;
  },

  async deletePackingItem(id: string): Promise<void> {
    await apiClient.delete(`/packing-items/${id}`);
  },

  async fetchJournalEntries(tripId: string): Promise<TripJournalEntryRecord[]> {
    const response = await apiClient.get<ApiCollection<TripJournalEntryRecord>>("/trip-journal-entries");
    return response.data.data.filter((entry) => entry.trip_id === tripId);
  },

  async fetchJournalEntry(id: string): Promise<TripJournalEntryRecord> {
    const response = await apiClient.get<ApiEnvelope<TripJournalEntryRecord>>(`/trip-journal-entries/${id}`);
    return response.data.data;
  },

  async updateJournalEntry(id: string, payload: Partial<Pick<TripJournalEntryRecord, "title" | "content" | "place_label" | "happened_at" | "day_label" | "emoji">>): Promise<TripJournalEntryRecord> {
    const response = await apiClient.patch<ApiEnvelope<TripJournalEntryRecord>>(`/trip-journal-entries/${id}`, payload);
    return response.data.data;
  },

  async createTripPhoto(payload: { trip_id: string; image: import("expo-image-picker").ImagePickerAsset; caption?: string }): Promise<TripPhotoRecord> {
    const formData = new FormData();
    const asset = payload.image;
    if (Platform.OS === "web" && asset.file) formData.append("image", asset.file);
    else formData.append("image", { uri: asset.uri, name: asset.fileName ?? "trip-photo.jpg", type: asset.mimeType ?? "image/jpeg" } as unknown as Blob);
    formData.append("trip_id", payload.trip_id);
    if (payload.caption) formData.append("caption", payload.caption);
    const response = await apiClient.post<ApiEnvelope<TripPhotoRecord>>("/photos", formData);
    return response.data.data;
  },
  async fetchPhotoComments(photoId?: string): Promise<PhotoCommentRecord[]> { const r = await apiClient.get<ApiCollection<PhotoCommentRecord>>("/photo-comments"); return photoId ? r.data.data.filter((x) => x.photo_id === photoId) : r.data.data; },
  async createPhotoComment(payload: { photo_id: string; member_id: string; content: string }): Promise<PhotoCommentRecord> { const r = await apiClient.post<ApiEnvelope<PhotoCommentRecord>>("/photo-comments", payload); return r.data.data; },
  async fetchPhotoComment(id: string): Promise<PhotoCommentRecord> { const r = await apiClient.get<ApiEnvelope<PhotoCommentRecord>>(`/photo-comments/${id}`); return r.data.data; },
  async updatePhotoComment(id: string, content: string): Promise<PhotoCommentRecord> { const r = await apiClient.patch<ApiEnvelope<PhotoCommentRecord>>(`/photo-comments/${id}`, { content }); return r.data.data; },
  async deletePhotoComment(id: string): Promise<void> { await apiClient.delete(`/photo-comments/${id}`); },

  async fetchTripPhotos(tripId: string): Promise<TripPhotoRecord[]> {
    const response = await apiClient.get<ApiCollection<TripPhotoRecord>>("/photos");
    return response.data.data.filter((photo) => photo.trip_id === tripId);
  },

  async fetchTripPhoto(id: string): Promise<TripPhotoRecord> { const r = await apiClient.get<ApiEnvelope<TripPhotoRecord>>(`/photos/${id}`); return r.data.data; },
  async updateTripPhoto(id: string, payload: Partial<Pick<TripPhotoRecord, "caption" | "status" | "taken_at" | "shared_to_story">>): Promise<TripPhotoRecord> { const r = await apiClient.patch<ApiEnvelope<TripPhotoRecord>>(`/photos/${id}`, payload); return r.data.data; },
  async deleteTripPhoto(id: string): Promise<void> { await apiClient.delete(`/photos/${id}`); },

  async fetchPlaces(): Promise<PlaceSearchRecord[]> { const r = await apiClient.get<ApiCollection<PlaceSearchRecord>>("/places"); return r.data.data; },
  async fetchPlace(id: string): Promise<PlaceSearchRecord> { const r = await apiClient.get<ApiEnvelope<PlaceSearchRecord>>(`/places/${id}`); return r.data.data; },
  async createPlace(payload: Partial<PlaceSearchRecord> & { name: string }): Promise<PlaceSearchRecord> { const r = await apiClient.post<ApiEnvelope<PlaceSearchRecord>>("/places", payload); return r.data.data; },
  async updatePlace(id: string, payload: Partial<PlaceSearchRecord>): Promise<PlaceSearchRecord> { const r = await apiClient.patch<ApiEnvelope<PlaceSearchRecord>>(`/places/${id}`, payload); return r.data.data; },
  async deletePlace(id: string): Promise<void> { await apiClient.delete(`/places/${id}`); },
  async fetchPlans(): Promise<Array<{ id: string; code: string; max_members: number; photo_quota_mb: number | null; features: Record<string, unknown> | null; price: number; billing_period: string | null }>> { const r = await apiClient.get<ApiCollection<{ id: string; code: string; max_members: number; photo_quota_mb: number | null; features: Record<string, unknown> | null; price: number; billing_period: string | null }>>("/plans"); return r.data.data; },
  async fetchPlan(id: string): Promise<{ id: string; code: string; max_members: number; photo_quota_mb: number | null; features: Record<string, unknown> | null; price: number; billing_period: string | null }> { const r = await apiClient.get<ApiEnvelope<{ id: string; code: string; max_members: number; photo_quota_mb: number | null; features: Record<string, unknown> | null; price: number; billing_period: string | null }>>(`/plans/${id}`); return r.data.data; },
  async createPlan(payload: { code: string; max_members: number; price: number; photo_quota_mb?: number; features?: Record<string, unknown>; billing_period?: string }): Promise<{ id: string; code: string; max_members: number; photo_quota_mb: number | null; features: Record<string, unknown> | null; price: number; billing_period: string | null }> { const r = await apiClient.post<ApiEnvelope<{ id: string; code: string; max_members: number; photo_quota_mb: number | null; features: Record<string, unknown> | null; price: number; billing_period: string | null }>>("/plans", payload); return r.data.data; },
  async updatePlan(id: string, payload: Partial<{ code: string; max_members: number; photo_quota_mb: number; features: Record<string, unknown>; price: number; billing_period: string }>): Promise<{ id: string; code: string; max_members: number; photo_quota_mb: number | null; features: Record<string, unknown> | null; price: number; billing_period: string | null }> { const r = await apiClient.patch<ApiEnvelope<{ id: string; code: string; max_members: number; photo_quota_mb: number | null; features: Record<string, unknown> | null; price: number; billing_period: string | null }>>(`/plans/${id}`, payload); return r.data.data; },
  async deletePlan(id: string): Promise<void> { await apiClient.delete(`/plans/${id}`); },

  async createJournalEntry(payload: { trip_id: string; title: string; content: string; place_label?: string; day_label?: string; emoji?: string }): Promise<TripJournalEntryRecord> {
    const response = await apiClient.post<ApiEnvelope<TripJournalEntryRecord>>("/trip-journal-entries", payload);
    return response.data.data;
  },

  async deleteJournalEntry(id: string): Promise<void> {
    await apiClient.delete(`/trip-journal-entries/${id}`);
  },

  async fetchTripPlaces(tripId: string): Promise<TripPlaceRecord[]> {
    const response = await apiClient.get<ApiCollection<TripPlaceRecord>>("/trip-places");
    return response.data.data.filter((place) => place.trip_id === tripId).sort((a, b) => a.position - b.position);
  },

  async fetchTripPlace(id: string): Promise<TripPlaceRecord> {
    const response = await apiClient.get<ApiEnvelope<TripPlaceRecord>>(`/trip-places/${id}`);
    return response.data.data;
  },

  async updateTripPlace(id: string, payload: Partial<Pick<TripPlaceRecord, "city" | "country" | "position" | "stay_start" | "stay_end" | "lodging_name" | "lodging_price" | "lodging_currency" | "note">>): Promise<TripPlaceRecord> {
    const response = await apiClient.patch<ApiEnvelope<TripPlaceRecord>>(`/trip-places/${id}`, payload);
    return response.data.data;
  },

  async createTripPlace(payload: { trip_id: string; city: string; country?: string; position: number; place_id?: string }): Promise<TripPlaceRecord> {
    const response = await apiClient.post<ApiEnvelope<TripPlaceRecord>>("/trip-places", payload);
    return response.data.data;
  },

  async deleteTripPlace(id: string): Promise<void> {
    await apiClient.delete(`/trip-places/${id}`);
  },

  async fetchActivities(tripId: string): Promise<ActivityRecord[]> {
    const response = await apiClient.get<ApiCollection<ActivityRecord>>("/activities");
    return response.data.data.filter((activity) => activity.trip_id === tripId);
  },

  async fetchActivity(id: string): Promise<ActivityRecord> {
    const response = await apiClient.get<ApiEnvelope<ActivityRecord>>(`/activities/${id}`);
    return response.data.data;
  },

  async updateActivity(id: string, payload: Partial<Pick<ActivityRecord, "title" | "description" | "starts_at" | "duration_min" | "estimated_cost" | "status" | "category" | "location_label" | "time_label">>): Promise<ActivityRecord> {
    const response = await apiClient.patch<ApiEnvelope<ActivityRecord>>(`/activities/${id}`, payload);
    return response.data.data;
  },

  async fetchActivityAttendees(tripId: string): Promise<ActivityAttendeeRecord[]> {
    const [attendeeResponse, activityResponse] = await Promise.all([
      apiClient.get<ApiCollection<ActivityAttendeeRecord>>("/activity-attendees"),
      apiClient.get<ApiCollection<ActivityRecord>>("/activities"),
    ]);
    const activityIds = new Set(activityResponse.data.data.filter((activity) => activity.trip_id === tripId).map((activity) => activity.id));
    return attendeeResponse.data.data.filter((attendee) => activityIds.has(attendee.activity_id));
  },

  async fetchActivityAttendee(id: string): Promise<ActivityAttendeeRecord> {
    const response = await apiClient.get<ApiEnvelope<ActivityAttendeeRecord>>(`/activity-attendees/${id}`);
    return response.data.data;
  },

  async createActivityAttendee(payload: { activity_id: string; member_id: string; rsvp: string }): Promise<ActivityAttendeeRecord> {
    const response = await apiClient.post<ApiEnvelope<ActivityAttendeeRecord>>("/activity-attendees", payload);
    return response.data.data;
  },

  async updateActivityAttendee(id: string, payload: Partial<Pick<ActivityAttendeeRecord, "rsvp">>): Promise<ActivityAttendeeRecord> {
    const response = await apiClient.patch<ApiEnvelope<ActivityAttendeeRecord>>(`/activity-attendees/${id}`, payload);
    return response.data.data;
  },

  async deleteActivityAttendee(id: string): Promise<void> {
    await apiClient.delete(`/activity-attendees/${id}`);
  },

  async createActivity(payload: { trip_id: string; trip_place_id: string; title: string; description?: string; category?: string; time_label?: string; location_label?: string }): Promise<ActivityRecord> {
    const response = await apiClient.post<ApiEnvelope<ActivityRecord>>("/activities", payload);
    return response.data.data;
  },

  async deleteActivity(id: string): Promise<void> {
    await apiClient.delete(`/activities/${id}`);
  },

  async fetchRoutePlan(tripId: string): Promise<RoutePlanResponse> {
    const response = await apiClient.get<RoutePlanResponse>(`/trips/${tripId}/route-plan`);
    return response.data;
  },
  async fetchTrips(): Promise<TripRecord[]> {
    const response = await apiClient.get<ApiCollection<TripRecord>>("/trips");
    return response.data.data;
  },

  async fetchDiscoverTrips(): Promise<PublicTripRecord[]> {
    const response = await apiClient.get<ApiCollection<PublicTripRecord>>("/discover/trips");
    return response.data.data;
  },

  async fetchDiscoverTrip(id: string): Promise<PublicTripRecord> { const r = await apiClient.get<ApiEnvelope<PublicTripRecord>>(`/discover/trips/${id}`); return r.data.data; },

  async fetchRouteSuggestions(country?: string): Promise<RouteSuggestionRecord[]> {
    const response = await apiClient.get<ApiCollection<RouteSuggestionRecord>>("/route-suggestions", {
      params: country ? { country } : {},
    });
    return response.data.data;
  },

  async searchPlaces(query: string, country?: string): Promise<PlaceSearchRecord[]> {
    const response = await apiClient.get<ApiCollection<PlaceSearchRecord>>("/places/search", {
      params: { q: query, ...(country ? { country } : {}), limit: 8 },
    });
    return response.data.data;
  },

  async fetchNearbyPlaces(latitude: number, longitude: number, category: string, location: string): Promise<NearbyPlaceSuggestion[]> {
    const response = await apiClient.get<ApiCollection<NearbyPlaceSuggestion>>("/places/nearby", {
      params: { latitude, longitude, category, location },
    });
    return response.data.data;
  },

  async fetchTrip(id: string): Promise<TripRecord> {
    const response = await apiClient.get<ApiEnvelope<TripRecord>>(`/trips/${id}`);
    return response.data.data;
  },

  async updateTrip(id: string, payload: Partial<Pick<TripRecord, "title" | "destination_label" | "display_dates" | "duration_days" | "planned_budget" | "visibility" | "status">>): Promise<TripRecord> {
    const response = await apiClient.patch<ApiEnvelope<TripRecord>>(`/trips/${id}`, payload);
    return response.data.data;
  },

  async deleteTrip(id: string): Promise<void> {
    await apiClient.delete(`/trips/${id}`);
  },

  async notifyTrip(id: string, payload: { title: string; body: string; category?: "normal" | "important" | "critical"; data?: Record<string, unknown> }): Promise<TripNotificationResult> {
    const response = await apiClient.post<TripNotificationResult>(`/trips/${id}/notifications`, payload);
    return response.data;
  },

  async createTrip(payload: CreateTripPayload): Promise<TripRecord> {
    const response = await apiClient.post<ApiEnvelope<TripRecord>>("/trips", payload);
    return response.data.data;
  },

  async createTripMember(payload: CreateTripMemberPayload): Promise<TripMemberRecord> {
    const response = await apiClient.post<ApiEnvelope<TripMemberRecord>>("/trip-members", payload);
    return response.data.data;
  },

  async fetchTripMembers(tripId?: string): Promise<TripMemberRecord[]> {
    const response = await apiClient.get<ApiCollection<TripMemberRecord>>("/trip-members");
    return tripId ? response.data.data.filter((member) => member.trip_id === tripId) : response.data.data;
  },

  async fetchTripMember(id: string): Promise<TripMemberRecord> {
    const response = await apiClient.get<ApiEnvelope<TripMemberRecord>>(`/trip-members/${id}`);
    return response.data.data;
  },

  async updateTripMember(id: string, payload: Partial<Pick<TripMemberRecord, "role" | "status">>): Promise<TripMemberRecord> {
    const response = await apiClient.patch<ApiEnvelope<TripMemberRecord>>(`/trip-members/${id}`, payload);
    return response.data.data;
  },

  async deleteTripMember(id: string): Promise<void> {
    await apiClient.delete(`/trip-members/${id}`);
  },

  async fetchPolls(tripId: string): Promise<PollRecord[]> {
    const response = await apiClient.get<ApiCollection<PollRecord>>("/polls");
    return response.data.data.filter((poll) => poll.trip_id === tripId);
  },

  async createPoll(payload: { trip_id: string; created_by: string; type: string; title: string }): Promise<PollRecord> {
    const response = await apiClient.post<ApiEnvelope<PollRecord>>("/polls", payload);
    return response.data.data;
  },

  async fetchPoll(id: string): Promise<PollRecord> { const r = await apiClient.get<ApiEnvelope<PollRecord>>(`/polls/${id}`); return r.data.data; },
  async updatePoll(id: string, payload: Partial<Pick<PollRecord, "title" | "type" | "status" | "closes_at">>): Promise<PollRecord> { const r = await apiClient.patch<ApiEnvelope<PollRecord>>(`/polls/${id}`, payload); return r.data.data; },
  async deletePoll(id: string): Promise<void> { await apiClient.delete(`/polls/${id}`); },

  async fetchPollOptions(pollId: string): Promise<PollOptionRecord[]> {
    const response = await apiClient.get<ApiCollection<PollOptionRecord>>("/poll-options");
    return response.data.data.filter((option) => option.poll_id === pollId);
  },

  async createPollOption(payload: { poll_id: string; label: string; position: number }): Promise<PollOptionRecord> {
    const response = await apiClient.post<ApiEnvelope<PollOptionRecord>>("/poll-options", payload);
    return response.data.data;
  },

  async fetchPollOption(id: string): Promise<PollOptionRecord> { const r = await apiClient.get<ApiEnvelope<PollOptionRecord>>(`/poll-options/${id}`); return r.data.data; },
  async updatePollOption(id: string, payload: Partial<Pick<PollOptionRecord, "label" | "position">>): Promise<PollOptionRecord> { const r = await apiClient.patch<ApiEnvelope<PollOptionRecord>>(`/poll-options/${id}`, payload); return r.data.data; },
  async deletePollOption(id: string): Promise<void> { await apiClient.delete(`/poll-options/${id}`); },
  async fetchPollAnswers(): Promise<PollAnswerRecord[]> {
    const response = await apiClient.get<ApiCollection<PollAnswerRecord>>("/poll-answers");
    return response.data.data;
  },

  async fetchPollAnswer(id: string): Promise<PollAnswerRecord> { const r = await apiClient.get<ApiEnvelope<PollAnswerRecord>>(`/poll-answers/${id}`); return r.data.data; },
  async deletePollAnswer(id: string): Promise<void> { await apiClient.delete(`/poll-answers/${id}`); },

  async createPollAnswer(payload: { option_id: string; member_id: string }): Promise<PollAnswerRecord> {
    const response = await apiClient.post<ApiEnvelope<PollAnswerRecord>>("/poll-answers", payload);
    return response.data.data;
  },

  async updatePollAnswer(id: string, optionId: string): Promise<PollAnswerRecord> {
    const response = await apiClient.patch<ApiEnvelope<PollAnswerRecord>>(`/poll-answers/${id}`, { option_id: optionId, changed_at: new Date().toISOString() });
    return response.data.data;
  },

  async fetchServices(): Promise<ServiceRecord[]> {
    const response = await apiClient.get<ApiCollection<ServiceRecord>>("/services");
    return response.data.data;
  },

  async fetchService(id: string): Promise<ServiceRecord> { const r = await apiClient.get<ApiEnvelope<ServiceRecord>>(`/services/${id}`); return r.data.data; },
  async createService(payload: Partial<ServiceRecord> & { title: string }): Promise<ServiceRecord> { const r = await apiClient.post<ApiEnvelope<ServiceRecord>>("/services", payload); return r.data.data; },
  async updateService(id: string, payload: Partial<ServiceRecord>): Promise<ServiceRecord> { const r = await apiClient.patch<ApiEnvelope<ServiceRecord>>(`/services/${id}`, payload); return r.data.data; },
  async deleteService(id: string): Promise<void> { await apiClient.delete(`/services/${id}`); },

  async fetchReactions(): Promise<Array<{ id: string; member_id: string; target_type: string; target_id: string; emoji: string }>> { const r = await apiClient.get<ApiCollection<{ id: string; member_id: string; target_type: string; target_id: string; emoji: string }>>("/reactions"); return r.data.data; },
  async fetchReaction(id: string): Promise<{ id: string; member_id: string; target_type: string; target_id: string; emoji: string }> { const r = await apiClient.get<ApiEnvelope<{ id: string; member_id: string; target_type: string; target_id: string; emoji: string }>>(`/reactions/${id}`); return r.data.data; },
  async createReaction(payload: { member_id: string; target_type: string; target_id: string; emoji: string }): Promise<{ id: string; member_id: string; target_type: string; target_id: string; emoji: string }> { const r = await apiClient.post<ApiEnvelope<{ id: string; member_id: string; target_type: string; target_id: string; emoji: string }>>("/reactions", payload); return r.data.data; },
  async updateReaction(id: string, payload: Partial<Pick<{ emoji: string }, "emoji">>): Promise<{ id: string; member_id: string; target_type: string; target_id: string; emoji: string }> { const r = await apiClient.patch<ApiEnvelope<{ id: string; member_id: string; target_type: string; target_id: string; emoji: string }>>(`/reactions/${id}`, payload); return r.data.data; },
  async deleteReaction(id: string): Promise<void> { await apiClient.delete(`/reactions/${id}`); },

  async fetchRecommendations(): Promise<Array<{ id: string; user_id: string; service_id: string; score: number; reason: string | null }>> { const r = await apiClient.get<ApiCollection<{ id: string; user_id: string; service_id: string; score: number; reason: string | null }>>("/recommendations"); return r.data.data; },
  async fetchRecommendation(id: string): Promise<{ id: string; user_id: string; service_id: string; score: number; reason: string | null }> { const r = await apiClient.get<ApiEnvelope<{ id: string; user_id: string; service_id: string; score: number; reason: string | null }>>(`/recommendations/${id}`); return r.data.data; },
  async createRecommendation(payload: { user_id: string; service_id: string; score: number; reason?: string }): Promise<{ id: string; user_id: string; service_id: string; score: number; reason: string | null }> { const r = await apiClient.post<ApiEnvelope<{ id: string; user_id: string; service_id: string; score: number; reason: string | null }>>("/recommendations", payload); return r.data.data; },
  async updateRecommendation(id: string, payload: Partial<{ service_id: string; score: number; reason: string }>): Promise<{ id: string; user_id: string; service_id: string; score: number; reason: string | null }> { const r = await apiClient.patch<ApiEnvelope<{ id: string; user_id: string; service_id: string; score: number; reason: string | null }>>(`/recommendations/${id}`, payload); return r.data.data; },
  async deleteRecommendation(id: string): Promise<void> { await apiClient.delete(`/recommendations/${id}`); },
  async fetchReminders(tripId?: string): Promise<Array<{ id: string; trip_id: string | null; outing_id: string | null; type: string; target_type: string | null; target_id: string | null; fire_at: string; status: string | null }>> { const r = await apiClient.get<ApiCollection<{ id: string; trip_id: string | null; outing_id: string | null; type: string; target_type: string | null; target_id: string | null; fire_at: string; status: string | null }>>("/reminders"); return tripId ? r.data.data.filter((x) => x.trip_id === tripId) : r.data.data; },
  async fetchReminder(id: string): Promise<{ id: string; trip_id: string | null; outing_id: string | null; type: string; target_type: string | null; target_id: string | null; fire_at: string; status: string | null }> { const r = await apiClient.get<ApiEnvelope<{ id: string; trip_id: string | null; outing_id: string | null; type: string; target_type: string | null; target_id: string | null; fire_at: string; status: string | null }>>(`/reminders/${id}`); return r.data.data; },
  async createReminder(payload: { trip_id?: string; outing_id?: string; type: string; target_type?: string; target_id?: string; fire_at: string; status?: string }): Promise<{ id: string; trip_id: string | null; outing_id: string | null; type: string; target_type: string | null; target_id: string | null; fire_at: string; status: string | null }> { const r = await apiClient.post<ApiEnvelope<{ id: string; trip_id: string | null; outing_id: string | null; type: string; target_type: string | null; target_id: string | null; fire_at: string; status: string | null }>>("/reminders", payload); return r.data.data; },
  async updateReminder(id: string, payload: Partial<{ type: string; target_type: string; target_id: string; fire_at: string; status: string }>): Promise<{ id: string; trip_id: string | null; outing_id: string | null; type: string; target_type: string | null; target_id: string | null; fire_at: string; status: string | null }> { const r = await apiClient.patch<ApiEnvelope<{ id: string; trip_id: string | null; outing_id: string | null; type: string; target_type: string | null; target_id: string | null; fire_at: string; status: string }>>(`/reminders/${id}`, payload); return r.data.data; },
  async deleteReminder(id: string): Promise<void> { await apiClient.delete(`/reminders/${id}`); },
  async fetchReports(): Promise<Array<{ id: string; reporter_id: string; target_type: string; target_id: string; reason: string; details: string | null; status: string | null }>> { const r = await apiClient.get<ApiCollection<{ id: string; reporter_id: string; target_type: string; target_id: string; reason: string; details: string | null; status: string | null }>>("/reports"); return r.data.data; },
  async fetchReport(id: string): Promise<{ id: string; reporter_id: string; target_type: string; target_id: string; reason: string; details: string | null; status: string | null }> { const r = await apiClient.get<ApiEnvelope<{ id: string; reporter_id: string; target_type: string; target_id: string; reason: string; details: string | null; status: string | null }>>(`/reports/${id}`); return r.data.data; },
  async createReport(payload: { reporter_id: string; target_type: string; target_id: string; reason: string; details?: string }): Promise<{ id: string; reporter_id: string; target_type: string; target_id: string; reason: string; details: string | null; status: string | null }> { const r = await apiClient.post<ApiEnvelope<{ id: string; reporter_id: string; target_type: string; target_id: string; reason: string; details: string | null; status: string | null }>>("/reports", payload); return r.data.data; },
  async updateReport(id: string, payload: Partial<{ reason: string; details: string; status: string }>): Promise<{ id: string; reporter_id: string; target_type: string; target_id: string; reason: string; details: string | null; status: string | null }> { const r = await apiClient.patch<ApiEnvelope<{ id: string; reporter_id: string; target_type: string; target_id: string; reason: string; details: string | null; status: string }>>(`/reports/${id}`, payload); return r.data.data; },
  async deleteReport(id: string): Promise<void> { await apiClient.delete(`/reports/${id}`); },
  async fetchSettlements(tripId: string): Promise<Array<{ id: string; trip_id: string; from_member: string; to_member: string; amount: number; status: string | null; confirmed_at: string | null }>> { const r = await apiClient.get<ApiCollection<{ id: string; trip_id: string; from_member: string; to_member: string; amount: number; status: string | null; confirmed_at: string | null }>>("/settlements"); return r.data.data.filter((x) => x.trip_id === tripId); },
  async fetchSettlement(id: string): Promise<{ id: string; trip_id: string; from_member: string; to_member: string; amount: number; status: string | null; confirmed_at: string | null }> { const r = await apiClient.get<ApiEnvelope<{ id: string; trip_id: string; from_member: string; to_member: string; amount: number; status: string | null; confirmed_at: string | null }>>(`/settlements/${id}`); return r.data.data; },
  async createSettlement(payload: { trip_id: string; from_member: string; to_member: string; amount: number; status?: string }): Promise<{ id: string; trip_id: string; from_member: string; to_member: string; amount: number; status: string | null; confirmed_at: string | null }> { const r = await apiClient.post<ApiEnvelope<{ id: string; trip_id: string; from_member: string; to_member: string; amount: number; status: string | null; confirmed_at: string | null }>>("/settlements", payload); return r.data.data; },
  async updateSettlement(id: string, payload: Partial<{ from_member: string; to_member: string; amount: number; status: string; confirmed_at: string }>): Promise<{ id: string; trip_id: string; from_member: string; to_member: string; amount: number; status: string | null; confirmed_at: string | null }> { const r = await apiClient.patch<ApiEnvelope<{ id: string; trip_id: string; from_member: string; to_member: string; amount: number; status: string | null; confirmed_at: string | null }>>(`/settlements/${id}`, payload); return r.data.data; },
  async deleteSettlement(id: string): Promise<void> { await apiClient.delete(`/settlements/${id}`); },

  async fetchBookings(tripId: string): Promise<BookingRecord[]> {
    const response = await apiClient.get<ApiCollection<BookingRecord>>("/bookings");
    return response.data.data.filter((booking) => booking.trip_id === tripId);
  },

  async fetchBooking(id: string): Promise<BookingRecord> {
    const response = await apiClient.get<ApiEnvelope<BookingRecord>>(`/bookings/${id}`);
    return response.data.data;
  },

  async updateBooking(id: string, payload: Partial<Pick<BookingRecord, "quantity" | "total_amount" | "status">>): Promise<BookingRecord> {
    const response = await apiClient.patch<ApiEnvelope<BookingRecord>>(`/bookings/${id}`, payload);
    return response.data.data;
  },

  async createBooking(payload: { trip_id: string; service_id: string; booked_by: string; quantity: number; total_amount: number; status: string }): Promise<BookingRecord> {
    const response = await apiClient.post<ApiEnvelope<BookingRecord>>("/bookings", payload);
    return response.data.data;
  },

  async deleteBooking(id: string): Promise<void> {
    await apiClient.delete(`/bookings/${id}`);
  },

  async fetchBudgets(): Promise<BudgetRecord[]> {
    const response = await apiClient.get<ApiCollection<BudgetRecord>>("/budgets");
    return response.data.data;
  },

  async fetchBudget(id: string): Promise<BudgetRecord> {
    const response = await apiClient.get<ApiEnvelope<BudgetRecord>>(`/budgets/${id}`);
    return response.data.data;
  },

  async updateBudget(id: string, payload: Partial<Pick<BudgetRecord, "total_planned" | "currency" | "version">>): Promise<BudgetRecord> {
    const response = await apiClient.patch<ApiEnvelope<BudgetRecord>>(`/budgets/${id}`, payload);
    return response.data.data;
  },

  async deleteBudget(id: string): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  },

  async createBudget(payload: CreateBudgetPayload): Promise<BudgetRecord> {
    const response = await apiClient.post<ApiEnvelope<BudgetRecord>>("/budgets", payload);
    return response.data.data;
  },

  async fetchBudgetLines(): Promise<BudgetLineRecord[]> {
    const response = await apiClient.get<ApiCollection<BudgetLineRecord>>("/budget-lines");
    return response.data.data;
  },

  async fetchBudgetLine(id: string): Promise<BudgetLineRecord> {
    const response = await apiClient.get<ApiEnvelope<BudgetLineRecord>>(`/budget-lines/${id}`);
    return response.data.data;
  },

  async updateBudgetLine(id: string, payload: Partial<Pick<BudgetLineRecord, "category" | "planned_amount">>): Promise<BudgetLineRecord> {
    const response = await apiClient.patch<ApiEnvelope<BudgetLineRecord>>(`/budget-lines/${id}`, payload);
    return response.data.data;
  },

  async deleteBudgetLine(id: string): Promise<void> {
    await apiClient.delete(`/budget-lines/${id}`);
  },

  async createBudgetLine(payload: CreateBudgetLinePayload): Promise<BudgetLineRecord> {
    const response = await apiClient.post<ApiEnvelope<BudgetLineRecord>>("/budget-lines", payload);
    return response.data.data;
  },

  async fetchContributions(tripId: string): Promise<ContributionRecord[]> {
    const response = await apiClient.get<ApiCollection<ContributionRecord>>("/contributions");
    return response.data.data.filter((contribution) => contribution.trip_id === tripId);
  },

  async createContribution(payload: { trip_id: string; member_id: string; expected_amount: number; paid_amount?: number; status?: string; due_date?: string }): Promise<ContributionRecord> {
    const response = await apiClient.post<ApiEnvelope<ContributionRecord>>("/contributions", payload);
    return response.data.data;
  },

  async fetchContribution(id: string): Promise<ContributionRecord> { const r = await apiClient.get<ApiEnvelope<ContributionRecord>>(`/contributions/${id}`); return r.data.data; },
  async updateContribution(id: string, payload: Partial<Pick<ContributionRecord, "expected_amount" | "paid_amount" | "status" | "due_date">>): Promise<ContributionRecord> { const r = await apiClient.patch<ApiEnvelope<ContributionRecord>>(`/contributions/${id}`, payload); return r.data.data; },
  async deleteContribution(id: string): Promise<void> { await apiClient.delete(`/contributions/${id}`); },

  async fetchDestinationProposals(): Promise<DestinationProposalRecord[]> {
    const response = await apiClient.get<ApiCollection<DestinationProposalRecord>>("/destination-proposals");
    return response.data.data;
  },

  async createDestinationProposal(payload: CreateDestinationProposalPayload): Promise<DestinationProposalRecord> {
    const response = await apiClient.post<ApiEnvelope<DestinationProposalRecord>>("/destination-proposals", payload);
    return response.data.data;
  },

  async fetchDestinationProposal(id: string): Promise<DestinationProposalRecord> { const r = await apiClient.get<ApiEnvelope<DestinationProposalRecord>>(`/destination-proposals/${id}`); return r.data.data; },
  async updateDestinationProposal(id: string, payload: Partial<Pick<DestinationProposalRecord, "name" | "pitch" | "lat" | "lng" | "estimated_cost">>): Promise<DestinationProposalRecord> { const r = await apiClient.patch<ApiEnvelope<DestinationProposalRecord>>(`/destination-proposals/${id}`, payload); return r.data.data; },
  async deleteDestinationProposal(id: string): Promise<void> { await apiClient.delete(`/destination-proposals/${id}`); },

  async fetchDeviceTokens(): Promise<DeviceTokenRecord[]> { const r = await apiClient.get<ApiCollection<DeviceTokenRecord>>("/device-tokens"); return r.data.data; },
  async createDeviceToken(payload: { user_id: string; platform: string; fcm_apns_token: string; last_seen_at?: string }): Promise<DeviceTokenRecord> { const r = await apiClient.post<ApiEnvelope<DeviceTokenRecord>>("/device-tokens", payload); return r.data.data; },
  async fetchDeviceToken(id: string): Promise<DeviceTokenRecord> { const r = await apiClient.get<ApiEnvelope<DeviceTokenRecord>>(`/device-tokens/${id}`); return r.data.data; },
  async updateDeviceToken(id: string, payload: Partial<Pick<DeviceTokenRecord, "platform" | "fcm_apns_token" | "last_seen_at">>): Promise<DeviceTokenRecord> { const r = await apiClient.patch<ApiEnvelope<DeviceTokenRecord>>(`/device-tokens/${id}`, payload); return r.data.data; },
  async deleteDeviceToken(id: string): Promise<void> { await apiClient.delete(`/device-tokens/${id}`); },

  async fetchEmergencyAlerts(tripId: string): Promise<EmergencyAlertRecord[]> { const r = await apiClient.get<ApiCollection<EmergencyAlertRecord>>("/emergency-alerts"); return r.data.data.filter((x) => x.trip_id === tripId); },
  async createEmergencyAlert(payload: { trip_id: string; member_id: string; lat: number; lng: number; position_is_last_known: boolean; status: string; triggered_at: string }): Promise<EmergencyAlertRecord> { const r = await apiClient.post<ApiEnvelope<EmergencyAlertRecord>>("/emergency-alerts", payload); return r.data.data; },
  async fetchEmergencyAlert(id: string): Promise<EmergencyAlertRecord> { const r = await apiClient.get<ApiEnvelope<EmergencyAlertRecord>>(`/emergency-alerts/${id}`); return r.data.data; },
  async updateEmergencyAlert(id: string, payload: Partial<Pick<EmergencyAlertRecord, "status" | "resolved_at">>): Promise<EmergencyAlertRecord> { const r = await apiClient.patch<ApiEnvelope<EmergencyAlertRecord>>(`/emergency-alerts/${id}`, payload); return r.data.data; },
  async deleteEmergencyAlert(id: string): Promise<void> { await apiClient.delete(`/emergency-alerts/${id}`); },
  async fetchEmergencyAlertRecipients(): Promise<EmergencyAlertRecipientRecord[]> { const r = await apiClient.get<ApiCollection<EmergencyAlertRecipientRecord>>("/emergency-alert-recipients"); return r.data.data; },
  async createEmergencyAlertRecipient(payload: { alert_id: string; member_id: string }): Promise<EmergencyAlertRecipientRecord> { const r = await apiClient.post<ApiEnvelope<EmergencyAlertRecipientRecord>>("/emergency-alert-recipients", payload); return r.data.data; },
  async fetchEmergencyAlertRecipient(id: string): Promise<EmergencyAlertRecipientRecord> { const r = await apiClient.get<ApiEnvelope<EmergencyAlertRecipientRecord>>(`/emergency-alert-recipients/${id}`); return r.data.data; },
  async updateEmergencyAlertRecipient(id: string, payload: Partial<Pick<EmergencyAlertRecipientRecord, "delivered_at" | "acknowledged_at">>): Promise<EmergencyAlertRecipientRecord> { const r = await apiClient.patch<ApiEnvelope<EmergencyAlertRecipientRecord>>(`/emergency-alert-recipients/${id}`, payload); return r.data.data; },
  async deleteEmergencyAlertRecipient(id: string): Promise<void> { await apiClient.delete(`/emergency-alert-recipients/${id}`); },

  async fetchExclusionRequest(id: string): Promise<ExclusionRequestRecord> { const r = await apiClient.get<ApiEnvelope<ExclusionRequestRecord>>(`/exclusion-requests/${id}`); return r.data.data; },
  async deleteExclusionRequest(id: string): Promise<void> { await apiClient.delete(`/exclusion-requests/${id}`); },

  async fetchExclusionRequests(): Promise<ExclusionRequestRecord[]> {
    const response = await apiClient.get<ApiCollection<ExclusionRequestRecord>>("/exclusion-requests");
    return response.data.data;
  },

  async createExclusionRequest(payload: CreateExclusionRequestPayload): Promise<ExclusionRequestRecord> {
    const response = await apiClient.post<ApiEnvelope<ExclusionRequestRecord>>("/exclusion-requests", payload);
    return response.data.data;
  },

  async updateExclusionRequest({ id, ...payload }: UpdateExclusionRequestPayload): Promise<ExclusionRequestRecord> {
    const response = await apiClient.put<ApiEnvelope<ExclusionRequestRecord>>(`/exclusion-requests/${id}`, payload);
    return response.data.data;
  },

  async fetchExchangeRate(id: string): Promise<ExchangeRateRecord> { const r = await apiClient.get<ApiEnvelope<ExchangeRateRecord>>(`/exchange-rates/${id}`); return r.data.data; },
  async updateExchangeRate(id: string, payload: Partial<Pick<ExchangeRateRecord, "base" | "quote" | "rate" | "source" | "fetched_at">>): Promise<ExchangeRateRecord> { const r = await apiClient.patch<ApiEnvelope<ExchangeRateRecord>>(`/exchange-rates/${id}`, payload); return r.data.data; },
  async deleteExchangeRate(id: string): Promise<void> { await apiClient.delete(`/exchange-rates/${id}`); },

  async fetchExchangeRates(): Promise<ExchangeRateRecord[]> {
    const response = await apiClient.get<ApiCollection<ExchangeRateRecord>>("/exchange-rates");
    return response.data.data;
  },

  async createExchangeRate(payload: { base: string; quote: string; rate: number; source?: string; fetched_at?: string }): Promise<ExchangeRateRecord> { const r = await apiClient.post<ApiEnvelope<ExchangeRateRecord>>("/exchange-rates", payload); return r.data.data; },

  async createGroupActivity(payload: { category: "outing" | "trip" | "circle"; group_id: string; group_name: string; title: string; description?: string; href?: string; icon?: string }): Promise<GroupActivityRecord> { const r = await apiClient.post<ApiEnvelope<GroupActivityRecord>>("/group-activities", payload); return r.data.data; },

  async fetchExpenses(tripId: string): Promise<ExpenseRecord[]> { const r = await apiClient.get<ApiCollection<ExpenseRecord>>("/expenses"); return r.data.data.filter((x) => x.trip_id === tripId); },
  async createExpense(payload: { trip_id: string; paid_by: string; budget_line_id?: string | null; title: string; amount: number; currency: string; split_mode: string; spent_at?: string; place_label?: string; comment?: string }): Promise<ExpenseRecord> { const r = await apiClient.post<ApiEnvelope<ExpenseRecord>>("/expenses", payload); return r.data.data; },
  async fetchExpense(id: string): Promise<ExpenseRecord> { const r = await apiClient.get<ApiEnvelope<ExpenseRecord>>(`/expenses/${id}`); return r.data.data; },
  async updateExpense(id: string, payload: Partial<Pick<ExpenseRecord, "title" | "amount" | "currency" | "split_mode" | "spent_at" | "place_label" | "comment">>): Promise<ExpenseRecord> { const r = await apiClient.patch<ApiEnvelope<ExpenseRecord>>(`/expenses/${id}`, payload); return r.data.data; },
  async deleteExpense(id: string): Promise<void> { await apiClient.delete(`/expenses/${id}`); },
  async fetchExpenseParticipants(expenseId?: string): Promise<ExpenseParticipantRecord[]> { const r = await apiClient.get<ApiCollection<ExpenseParticipantRecord>>("/expense-participants"); return expenseId ? r.data.data.filter((x) => x.expense_id === expenseId) : r.data.data; },
  async createExpenseParticipant(payload: { expense_id: string; member_id: string; share_amount: number; share_weight?: number }): Promise<ExpenseParticipantRecord> { const r = await apiClient.post<ApiEnvelope<ExpenseParticipantRecord>>("/expense-participants", payload); return r.data.data; },
  async fetchExpenseParticipant(id: string): Promise<ExpenseParticipantRecord> { const r = await apiClient.get<ApiEnvelope<ExpenseParticipantRecord>>(`/expense-participants/${id}`); return r.data.data; },
  async updateExpenseParticipant(id: string, payload: Partial<Pick<ExpenseParticipantRecord, "share_amount" | "share_weight">>): Promise<ExpenseParticipantRecord> { const r = await apiClient.patch<ApiEnvelope<ExpenseParticipantRecord>>(`/expense-participants/${id}`, payload); return r.data.data; },
  async deleteExpenseParticipant(id: string): Promise<void> { await apiClient.delete(`/expense-participants/${id}`); },

  async fetchMeetingPoints(tripId: string): Promise<MeetingPointRecord[]> { const r = await apiClient.get<ApiCollection<MeetingPointRecord>>("/meeting-points"); return r.data.data.filter((x) => x.trip_id === tripId); },
  async createMeetingPoint(payload: { trip_id: string; name: string; lat?: number | null; lng?: number | null; meet_at?: string | null; instructions?: string | null }): Promise<MeetingPointRecord> { const r = await apiClient.post<ApiEnvelope<MeetingPointRecord>>("/meeting-points", payload); return r.data.data; },
  async fetchMeetingPoint(id: string): Promise<MeetingPointRecord> { const r = await apiClient.get<ApiEnvelope<MeetingPointRecord>>(`/meeting-points/${id}`); return r.data.data; },
  async updateMeetingPoint(id: string, payload: Partial<Pick<MeetingPointRecord, "name" | "lat" | "lng" | "meet_at" | "instructions">>): Promise<MeetingPointRecord> { const r = await apiClient.patch<ApiEnvelope<MeetingPointRecord>>(`/meeting-points/${id}`, payload); return r.data.data; },
  async deleteMeetingPoint(id: string): Promise<void> { await apiClient.delete(`/meeting-points/${id}`); },

  async fetchLocationShares(tripId: string): Promise<LocationShareRecord[]> { const r = await apiClient.get<ApiCollection<LocationShareRecord>>("/location-shares"); return r.data.data.filter((x) => x.trip_id === tripId); },
  async createLocationShare(payload: { trip_id: string; member_id: string; duration_mode: string; started_at: string; expires_at: string }): Promise<LocationShareRecord> { const r = await apiClient.post<ApiEnvelope<LocationShareRecord>>("/location-shares", payload); return r.data.data; },
  async fetchLocationShare(id: string): Promise<LocationShareRecord> { const r = await apiClient.get<ApiEnvelope<LocationShareRecord>>(`/location-shares/${id}`); return r.data.data; },
  async updateLocationShare(id: string, payload: Partial<Pick<LocationShareRecord, "duration_mode" | "expires_at" | "stopped_at">>): Promise<LocationShareRecord> { const r = await apiClient.patch<ApiEnvelope<LocationShareRecord>>(`/location-shares/${id}`, payload); return r.data.data; },
  async deleteLocationShare(id: string): Promise<void> { await apiClient.delete(`/location-shares/${id}`); },
  async fetchLocationPoints(): Promise<LocationPointRecord[]> { const r = await apiClient.get<ApiCollection<LocationPointRecord>>("/location-points"); return r.data.data; },
  async createLocationPoint(payload: { share_id: string; lat: number; lng: number; accuracy_m?: number; recorded_at: string }): Promise<LocationPointRecord> { const r = await apiClient.post<ApiEnvelope<LocationPointRecord>>("/location-points", payload); return r.data.data; },
  async fetchLocationPoint(id: string): Promise<LocationPointRecord> { const r = await apiClient.get<ApiEnvelope<LocationPointRecord>>(`/location-points/${id}`); return r.data.data; },
  async updateLocationPoint(id: string, payload: Partial<Pick<LocationPointRecord, "lat" | "lng" | "accuracy_m" | "recorded_at">>): Promise<LocationPointRecord> { const r = await apiClient.patch<ApiEnvelope<LocationPointRecord>>(`/location-points/${id}`, payload); return r.data.data; },
  async deleteLocationPoint(id: string): Promise<void> { await apiClient.delete(`/location-points/${id}`); },

  async fetchModerationActions(): Promise<ModerationActionRecord[]> { const r = await apiClient.get<ApiCollection<ModerationActionRecord>>("/moderation-actions"); return r.data.data; },
  async createModerationAction(payload: { report_id: string; moderator_id: string; action: string; note?: string }): Promise<ModerationActionRecord> { const r = await apiClient.post<ApiEnvelope<ModerationActionRecord>>("/moderation-actions", payload); return r.data.data; },
  async fetchModerationAction(id: string): Promise<ModerationActionRecord> { const r = await apiClient.get<ApiEnvelope<ModerationActionRecord>>(`/moderation-actions/${id}`); return r.data.data; },
  async updateModerationAction(id: string, payload: Partial<Pick<ModerationActionRecord, "action" | "note">>): Promise<ModerationActionRecord> { const r = await apiClient.patch<ApiEnvelope<ModerationActionRecord>>(`/moderation-actions/${id}`, payload); return r.data.data; },
  async deleteModerationAction(id: string): Promise<void> { await apiClient.delete(`/moderation-actions/${id}`); },
  async fetchPartners(): Promise<PartnerRecord[]> { const r = await apiClient.get<ApiCollection<PartnerRecord>>("/partners"); return r.data.data; },
  async createPartner(payload: Omit<PartnerRecord, "id">): Promise<PartnerRecord> { const r = await apiClient.post<ApiEnvelope<PartnerRecord>>("/partners", payload); return r.data.data; },
  async fetchPartner(id: string): Promise<PartnerRecord> { const r = await apiClient.get<ApiEnvelope<PartnerRecord>>(`/partners/${id}`); return r.data.data; },
  async updatePartner(id: string, payload: Partial<Omit<PartnerRecord, "id">>): Promise<PartnerRecord> { const r = await apiClient.patch<ApiEnvelope<PartnerRecord>>(`/partners/${id}`, payload); return r.data.data; },
  async deletePartner(id: string): Promise<void> { await apiClient.delete(`/partners/${id}`); },
  async fetchOfflineSyncQueue(tripId?: string): Promise<OfflineSyncQueueRecord[]> { const r = await apiClient.get<ApiCollection<OfflineSyncQueueRecord>>("/offline-sync-queue"); return tripId ? r.data.data.filter((x) => x.trip_id === tripId) : r.data.data; },
  async createOfflineSyncQueue(payload: { user_id: string; trip_id: string; operation: string; payload: Record<string, unknown>; client_op_id: string; status?: string }): Promise<OfflineSyncQueueRecord> { const r = await apiClient.post<ApiEnvelope<OfflineSyncQueueRecord>>("/offline-sync-queue", payload); return r.data.data; },
  async fetchOfflineSyncItem(id: string): Promise<OfflineSyncQueueRecord> { const r = await apiClient.get<ApiEnvelope<OfflineSyncQueueRecord>>(`/offline-sync-queue/${id}`); return r.data.data; },
  async updateOfflineSyncItem(id: string, payload: Partial<Pick<OfflineSyncQueueRecord, "operation" | "payload" | "status">>): Promise<OfflineSyncQueueRecord> { const r = await apiClient.patch<ApiEnvelope<OfflineSyncQueueRecord>>(`/offline-sync-queue/${id}`, payload); return r.data.data; },
  async deleteOfflineSyncItem(id: string): Promise<void> { await apiClient.delete(`/offline-sync-queue/${id}`); },

  async fetchNotificationPreference(id: string): Promise<NotificationPreferenceRecord> { const r = await apiClient.get<ApiEnvelope<NotificationPreferenceRecord>>(`/notification-preferences/${id}`); return r.data.data; },
  async deleteNotificationPreference(id: string): Promise<void> { await apiClient.delete(`/notification-preferences/${id}`); },
  async fetchNotification(id: string): Promise<AppNotificationRecord> { const r = await apiClient.get<ApiEnvelope<AppNotificationRecord>>(`/notifications/${id}`); return r.data.data; },

  async fetchGroupActivities(): Promise<GroupActivityRecord[]> {
    const response = await apiClient.get<ApiCollection<GroupActivityRecord>>("/group-activities");
    return response.data.data;
  },

  async fetchNotifications(): Promise<AppNotificationRecord[]> {
    const response = await apiClient.get<ApiCollection<AppNotificationRecord>>("/notifications");
    return response.data.data;
  },

  async markNotificationRead(id: string): Promise<AppNotificationRecord> {
    const response = await apiClient.patch<ApiEnvelope<AppNotificationRecord>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllNotificationsRead(): Promise<void> {
    await apiClient.post("/notifications/read-all");
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async fetchNotificationPreferences(): Promise<NotificationPreferenceRecord[]> {
    const response = await apiClient.get<ApiCollection<NotificationPreferenceRecord>>("/notification-preferences");
    return response.data.data;
  },

  async createNotificationPreferences(
    payload: UpdateNotificationPreferencePayload & { user_id: string },
  ): Promise<NotificationPreferenceRecord> {
    const response = await apiClient.post<ApiEnvelope<NotificationPreferenceRecord>>(
      "/notification-preferences",
      payload,
    );
    return response.data.data;
  },

  async updateNotificationPreferences(
    payload: UpdateNotificationPreferencePayload & { id: string },
  ): Promise<NotificationPreferenceRecord> {
    const { id, ...changes } = payload;
    const response = await apiClient.put<ApiEnvelope<NotificationPreferenceRecord>>(
      `/notification-preferences/${id}`,
      changes,
    );
    return response.data.data;
  },
};