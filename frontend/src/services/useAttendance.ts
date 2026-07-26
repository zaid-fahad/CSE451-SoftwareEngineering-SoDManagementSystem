import { useState, useCallback } from 'react';
import { AttendanceRecord, MarkAttendancePayload } from '../model/attendance';

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-101',
    dutyId: 'duty-001',
    dutyTitle: 'CS101 Lab Supervision - Room 302',
    studentId: 'usr-101',
    studentName: 'Alice Smith',
    date: '2026-07-20',
    status: 'Present',
    hoursCompleted: 2.0,
    notes: 'On time, assisted 25 students with lab exercise.',
  },
  {
    id: 'att-102',
    dutyId: 'duty-002',
    dutyTitle: 'CS202 Midterm Exam Proctoring',
    studentId: 'usr-101',
    studentName: 'Alice Smith',
    date: '2026-07-22',
    status: 'Present',
    hoursCompleted: 3.0,
    notes: 'Exam invigilation completed without incident.',
  },
  {
    id: 'att-103',
    dutyId: 'duty-001',
    dutyTitle: 'CS101 Lab Supervision - Room 302',
    studentId: 'usr-102',
    studentName: 'Bob Johnson',
    date: '2026-07-20',
    status: 'Late',
    hoursCompleted: 1.5,
    notes: 'Arrived 30 mins late due to class delay.',
  },
];

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);

  const markAttendance = useCallback((payload: MarkAttendancePayload): AttendanceRecord => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      ...payload,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  }, []);

  const getStudentAttendance = useCallback((studentIdOrEmail: string) => {
    return attendanceRecords.filter(
      (rec) => rec.studentId === studentIdOrEmail || rec.studentName.toLowerCase().includes(studentIdOrEmail.toLowerCase())
    );
  }, [attendanceRecords]);

  const getStudentTotalHours = useCallback((studentIdOrEmail: string) => {
    const recs = getStudentAttendance(studentIdOrEmail);
    return recs.reduce((sum, r) => sum + (r.status === 'Present' || r.status === 'Late' ? r.hoursCompleted : 0), 0);
  }, [getStudentAttendance]);

  return {
    attendanceRecords,
    markAttendance,
    getStudentAttendance,
    getStudentTotalHours,
  };
};
