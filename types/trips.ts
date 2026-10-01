import type {
  AppNotificationRecord,
  BudgetLineRecord,
  BudgetRecord,
  DestinationProposalRecord,
  ExchangeRateRecord,
  ExclusionRequestRecord,
  GroupActivityRecord,
  NotificationPreferenceRecord,
  TripMemberRecord,
  TripRecord,
} from "@/interface/trips";
import type { RequestStatus } from "@/types/auth";

export interface TripsState {
  trips: TripRecord[];
  activeTrip: TripRecord | null;
  members: TripMemberRecord[];
  budgets: BudgetRecord[];
  budgetLines: BudgetLineRecord[];
  destinationProposals: DestinationProposalRecord[];
  exclusionRequests: ExclusionRequestRecord[];
  exchangeRates: ExchangeRateRecord[];
  groupActivities: GroupActivityRecord[];
  notifications: AppNotificationRecord[];
  notificationPreferences: NotificationPreferenceRecord[];
  requestStatus: RequestStatus;
  error: string | null;
  notice: string | null;
}