import { DayOfWeek } from './schedule';
import { User } from './user';

export type DutyType = 'LabDuty' | 'ExamDuty' | 'GeneralDuty';

export interface ScheduleConflict {
  hasConflict: boolean;
  type?: 'Class' | 'Busy';
  conflictingCourse?: string;
  timeSlot?: string;
  reason?: string;
}

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
  assignedFaculty?: string;
}

export interface DutyCreateRequest {
  title: string;
  location: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  type: DutyType;
  maxStudents: number;
  assignedStudentId?: string;
  assignedFaculty?: string;
}
