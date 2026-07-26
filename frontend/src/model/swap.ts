import { DayOfWeek } from './schedule';
import { User } from './user';

export type SwapStatus = 'Pending' | 'Accepted' | 'Cancelled';

export interface SwapRequest {
  id: string;
  originalDutyId: string;
  dutyTitle: string;
  location: string;
  day: DayOfWeek;
  time: string;
  requestingStudent: User;
  acceptingStudent?: User;
  status: SwapStatus;
  createdAt: string;
  reason?: string;
}

export interface SwapCreatePayload {
  originalDutyId: string;
  dutyTitle: string;
  location: string;
  day: DayOfWeek;
  time: string;
  reason?: string;
}
