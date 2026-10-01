import type {
  CircleRecord,
  InvitationRecord,
  OutingRecord,
} from "@/interface/groups";
import type { RequestStatus } from "@/types/auth";

export interface GroupsState {
  circles: CircleRecord[];
  outings: OutingRecord[];
  activeOuting: OutingRecord | null;
  invitations: InvitationRecord[];
  requestStatus: RequestStatus;
  error: string | null;
  notice: string | null;
}