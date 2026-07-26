import { DayOfWeek } from './schedule';
import { User } from './user';

export type DutyType = 'LabDuty' | 'ExamDuty' | 'GeneralDuty';

export interface DutySlot {
  id: string;
  title: string;
  location: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  type: DutyType;
  maxStudents: number;
  assignedStudents: User[];
}

export interface DutyCreateRequest {
  title: string;
  location: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  type: DutyType;
  maxStudents: number;
}
