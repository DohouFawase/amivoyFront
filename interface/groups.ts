export interface CircleRecord {
  id: string;
  creator_id: string;
  name: string;
  members: string[];
  member_user_ids: string[];
  memberUserIds?: string[];
  created_at: string;
  createdAt?: string;
}

export interface OutingPhotoRecord {
  id: string;
  uri: string | null;
  url: string | null;
  caption: string | null;
  by: string | null;
  createdAt: string | null;
  sharedToStory: boolean;
}

export interface OutingContributionRecord {
  id: string;
  by: string;
  amount: number;
  createdAt: string | null;
}

export interface OutingRecord {
  id: string;
  creator_id: string;
  circleId: string | null;
  circleName: string | null;
  title: string;
  place: string;
  locationType: "public" | "private";
  category: string;
  date: string | null;
  time: string | null;
  note: string | null;
  activity: string | null;
  budgetTarget: number | null;
  currency: string;
  latitude: number | null;
  longitude: number | null;
  guests: string[];
  participantUserIds: string[];
  attending: string[];
  checkedIn: string[];
  contributions: OutingContributionRecord[];
  photos: OutingPhotoRecord[];
  started: boolean;
  ended: boolean;
  startedAt: string | null;
  endedAt: string | null;
  created_at: string;
}

export type InvitationChannel = "whatsapp" | "sms" | "email" | "link";
export type InvitationStatus = "pending" | "accepted" | "declined" | "sent";

export interface InvitationRecord {
  id: string;
  circle_id: string | null;
  trip_id: string | null;
  outing_id: string | null;
  invited_by: string;
  recipient_user_id: string | null;
  target: string | null;
  invite_url?: string;
  email_sent?: boolean | null;
  channel: string;
  channelCode: InvitationChannel;
  status: string;
  statusCode: InvitationStatus;
  name: string | null;
  destination: string | null;
  expires_at: string | null;
  created_at: string;
}

export type InvitationResourceTarget =
  | { circle_id: string; outing_id?: never; trip_id?: never }
  | { outing_id: string; circle_id?: never; trip_id?: never }
  | { trip_id: string; circle_id?: never; outing_id?: never };

export type CreateInvitationPayload = InvitationResourceTarget & {
  channel: InvitationChannel;
  target?: string;
  recipient_user_id?: string;
  expires_at?: string;
};

export interface CreateCirclePayload {
  name: string;
  members?: string[];
  member_user_ids?: string[];
}

export interface CreateOutingPayload {
  circle_id?: string | null;
  title: string;
  place: string;
  location_type: "public" | "private";
  category: string;
  date_label?: string | null;
  time_label?: string | null;
  note?: string | null;
  activity?: string | null;
  budget_target?: number | null;
  currency?: string;
  latitude?: number | null;
  longitude?: number | null;
  guests?: string[];
  participant_user_ids?: string[];
}

export interface UpdateOutingPayload {
  id: string;
  changes: Partial<Omit<CreateOutingPayload, "participant_user_ids">>;
}

export interface OutingIdPayload {
  id: string;
}

export interface OutingRsvpPayload extends OutingIdPayload {
  attending: boolean;
}

export interface OutingContributionPayload extends OutingIdPayload {
  amount: number;
}

export interface OutingPhotoPayload extends OutingIdPayload {
  asset: import("expo-image-picker").ImagePickerAsset;
  caption?: string;
}

export interface ToggleOutingStoryPayload extends OutingIdPayload {
  photoId: string;
}

export interface RespondInvitationPayload {
  code: string;
  status: "accepted" | "declined";
}

export interface RespondInvitationByIdPayload {
  id: string;
  status: "accepted" | "declined";
}