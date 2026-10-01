export interface TripRecord {
  id: string;
  creator_id: string;
  circle_id: string | null;
  name: string;
  title: string;
  destination_label: string | null;
  destination: string | null;
  image: string | null;
  color: string | null;
  next: string | null;
  circleName: string | null;
  description: string | null;
  cover_url: string | null;
  cover_color: string | null;
  display_dates: string | null;
  dates: string | null;
  duration_days: number | null;
  days: number | null;
  start_date: string | null;
  end_date: string | null;
  currency: string | null;
  planned_budget: number | null;
  budget: number;
  people: number;
  estimated_members: number | null;
  members: string[];
  stops?: TripPlaceRecord[];
  visibility: "private" | "public";
  isPrivate: boolean;
  status: string | null;
  spent: number | null;
  created_at: string;
}

export interface PlaceSearchRecord {
  id: string;
  name: string;
  category: string | null;
  description: string;
  address: string | null;
  country: string | null;
  region: string | null;
  place_type: string | null;
  lat: number | null;
  lng: number | null;
  latitude: number | null;
  longitude: number | null;
  emoji: string | null;
  isCountry: boolean;
}

export interface NearbyPlaceSuggestion {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  source: string;
  sourceUrl: string;
  verificationStatus: 'mapped' | 'verified';
  verified: boolean;
}

export interface RouteSuggestionRecord {
  id: string;
  country: string;
  name: string;
  subtitle: string;
  days: string;
  distance: string;
  emoji: string;
  tint: string;
  stops: string[];
}

export interface PublicTripRecord {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  destination_label: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface EmergencyAlertRecord {
  id: string; trip_id: string; member_id: string; lat: number; lng: number; position_is_last_known: boolean; status: string | null; triggered_at: string | null; resolved_at: string | null;
}
export interface EmergencyAlertRecipientRecord { id: string; alert_id: string; member_id: string; delivered_at: string | null; acknowledged_at: string | null; }
export interface DeviceTokenRecord { id: string; user_id: string; platform: string; fcm_apns_token?: string; last_seen_at: string | null; }

export interface TripNotificationResult {
  message: string;
  recipients: number;
}

export interface TripMemberRecord {
  id: string;
  trip_id: string;
  user_id: string | null;
  role: string;
  status: string;
  joined_at: string | null;
  left_at: string | null;
  user?: { first_name?: string; email?: string } | null;
}

export interface PackingItemRecord {
  id: string;
  trip_id: string;
  title: string;
  label: string;
  category: string | null;
  quantity: number;
  is_packed: boolean;
  done: boolean;
  notes: string | null;
  created_at: string;
}

export interface TripPhotoRecord {
  id: string;
  trip_id: string | null;
  outing_id: string | null;
  caption: string | null;
  shared_to_story: boolean;
  uploaded_by: string | null;
  storage_key: string | null;
  thumbnail_key: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  status: string | null;
  taken_at: string | null;
  url: string | null;
  uri: string | null;
  createdAt: string | null;
  by: string | null;
}

export interface TripJournalEntryRecord {
  id: string;
  trip_id: string;
  author_id: string;
  title: string | null;
  content: string;
  body: string;
  place_label: string | null;
  happened_at: string | null;
  day_label: string | null;
  day: string | null;
  emoji: string | null;
  created_at: string;
  author?: { first_name?: string } | null;
}

export interface TripPlaceRecord {
  id: string;
  trip_id: string;
  city: string;
  country: string | null;
  position: number;
  stay_start: string | null;
  stay_end: string | null;
  lodging_name: string | null;
  lodging_price: number | null;
  lodging_currency: string;
  note: string | null;
  activities?: string[];
  activityItems?: ActivityRecord[];
}

export interface ActivityAttendeeRecord {
  id: string;
  activity_id: string;
  member_id: string;
  rsvp: string;
}

export interface ContributionRecord {
  id: string;
  trip_id: string;
  member_id: string;
  expected_amount: number;
  paid_amount: number | null;
  status: string | null;
  due_date: string | null;
  created_at: string;
}

export interface ActivityRecord {
  id: string;
  trip_id: string;
  trip_place_id: string | null;
  title: string;
  description: string | null;
  starts_at: string | null;
  duration_min: number | null;
  estimated_cost: number | null;
  status: string | null;
  category: string | null;
  icon: string | null;
  location_label: string | null;
  time_label: string | null;
}

export interface ServiceRecord {
  id: string;
  title: string;
  name: string | null;
  category: string | null;
  description: string | null;
  price: number;
  currency: string;
  icon: string | null;
  rating: number | null;
}

export interface BookingRecord {
  id: string;
  trip_id: string;
  service_id: string;
  booked_by: string;
  quantity: number;
  total_amount: number;
  status: string | null;
  created_at: string;
}

export interface PollRecord {
  id: string;
  trip_id: string;
  created_by: string;
  type: string;
  title: string;
  status: string | null;
  closes_at: string | null;
}

export interface PollOptionRecord {
  id: string;
  poll_id: string;
  label: string;
  position: number | null;
}

export interface PollAnswerRecord {
  id: string;
  option_id: string;
  member_id: string;
}

export interface RoutePlanResponse {
  trip_id: string;
  method: string;
  distance_type: string;
  estimated_total_distance_km: number;
  stops_without_coordinates: number;
  stops: Array<{ trip_place_id: string; name: string; address: string | null; distance_from_previous_km: number }>;
}

export interface BudgetRecord {
  id: string;
  trip_id: string;
  total_planned: number;
  currency: string;
  version: number | null;
  created_at: string;
}

export interface BudgetLineRecord {
  id: string;
  budget_id: string;
  category: string;
  planned_amount: number;
  created_at: string;
}

export interface DestinationProposalRecord {
  id: string;
  trip_id: string;
  proposed_by: string;
  name: string;
  lat: number | null;
  lng: number | null;
  pitch: string | null;
  estimated_cost: number | null;
  created_at: string;
}

export interface ExclusionRequestRecord {
  id: string;
  trip_id: string;
  target_member_id: string;
  requested_by: string;
  poll_id: string | null;
  reason: string;
  status: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface MeetingPointRecord { id: string; trip_id: string; created_by: string | null; activity_id: string | null; name: string; lat: number | null; lng: number | null; meet_at: string | null; instructions: string | null; }
export interface ModerationActionRecord { id: string; report_id: string; moderator_id: string; action: string; note: string | null; created_at: string; }
export interface OfflineSyncQueueRecord { id: string; user_id: string; trip_id: string; operation: string; payload: Record<string, unknown>; client_op_id: string; status: string | null; created_at: string; }
export interface PartnerRecord { id: string; name: string; type: string; country: string; commission_rate: number | null; contact_email: string | null; status: string | null; }
export interface PhotoCommentRecord { id: string; photo_id: string; member_id: string; content: string; created_at: string; }

export interface ExpenseRecord {
  id: string; trip_id: string; paid_by: string; budget_line_id: string | null; title: string; amount: number; currency: string; fx_rate: number | null; split_mode: string; spent_at: string | null; place_label: string | null; receipt_url: string | null; comment: string | null; icon: string | null; color: string | null; created_at: string;
}
export interface ExpenseParticipantRecord { id: string; expense_id: string; member_id: string; share_amount: number; share_weight: number | null; }
export interface LocationShareRecord { id: string; trip_id: string; member_id: string; duration_mode: string | null; started_at: string | null; expires_at: string; stopped_at: string | null; }
export interface LocationPointRecord { id: string; share_id: string; lat: number; lng: number; accuracy_m: number | null; recorded_at: string; }

export interface ExchangeRateRecord {
  id: string;
  base: string;
  quote: string;
  rate: number;
  source: string | null;
  fetched_at: string | null;
  created_at: string;
}

export interface GroupActivityRecord {
  id: string;
  category: "outing" | "trip" | "circle";
  group_id: string;
  groupId: string;
  group_name: string;
  groupName: string;
  title: string;
  description: string | null;
  actor: string | null;
  icon: string | null;
  href: string | null;
  time_label: string | null;
  time: string | null;
  created_at: string;
}

export interface AppNotificationRecord {
  id: string;
  title: string;
  body: string;
  message: string;
  category: string;
  read_at: string | null;
  read: boolean;
  time: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationPreferenceRecord {
  id: string;
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  per_type_settings: Record<string, boolean> | null;
  quiet_from: string | null;
  quiet_to: string | null;
}

export interface CreateTripPayload {
  name: string;
  circle_id?: string | null;
  member_names?: string[];
  display_dates?: string | null;
  duration_days?: number | null;
  description?: string | null;
  cover_url?: string | null;
  cover_color?: string | null;
  destination_label?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  currency?: string | null;
  planned_budget?: number | null;
  estimated_members?: number | null;
  status?: string | null;
  governance_rules?: string[] | null;
  visibility?: "private" | "public";
}

export interface CreateTripMemberPayload {
  trip_id: string;
  user_id: string;
  role: string;
  status: string;
}

export interface CreateBudgetPayload {
  trip_id: string;
  total_planned: number;
  currency: string;
}

export interface CreateBudgetLinePayload {
  budget_id: string;
  category: string;
  planned_amount: number;
}

export interface CreateDestinationProposalPayload {
  trip_id: string;
  proposed_by: string;
  name: string;
  lat?: number | null;
  lng?: number | null;
  pitch?: string | null;
  estimated_cost?: number | null;
}

export interface CreateExclusionRequestPayload {
  trip_id: string;
  target_member_id: string;
  requested_by: string;
  reason: string;
  poll_id?: string | null;
}

export interface UpdateExclusionRequestPayload {
  id: string;
  status: string;
  decided_at?: string;
}

export interface UpdateNotificationPreferencePayload {
  id?: string;
  user_id?: string;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  per_type_settings?: Record<string, boolean>;
  quiet_from?: string | null;
  quiet_to?: string | null;
}