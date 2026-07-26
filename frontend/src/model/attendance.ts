export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRecord {
  id: string;
  dutyId: string;
  dutyTitle: string;
  studentId: string;
  studentName: string;
  date: string; // e.g. '2026-07-26'
  status: AttendanceStatus;
  hoursCompleted: number;
  notes?: string;
}

export interface MarkAttendancePayload {
  dutyId: string;
  dutyTitle: string;
  studentId: string;
  studentName: string;
  date: string;
  status: AttendanceStatus;
  hoursCompleted: number;
  notes?: string;
}
