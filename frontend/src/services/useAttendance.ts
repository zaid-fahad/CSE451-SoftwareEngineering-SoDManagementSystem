import { useState, useCallback } from 'react';
import { AttendanceRecord, MarkAttendancePayload } from '../model/attendance';
import { DutySlot } from '../model/duty';
import { User } from '../model/user';

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-101',
    dutyId: 'duty-001',
    dutyTitle: 'CS101 Lab Supervision - Room 302',
    studentId: 'usr-101',
    studentName: 'Alice Smith',
    date: '2026-07-26',
    status: 'Present',
    hoursCompleted: 2.0,
    notes: 'On time via Wireless RFID hardware check-in.',
    rfidTag: 'RFID-2021-001',
    method: 'RFID_Scan',
    scanTimestamp: '08:58 AM',
  },
  {
    id: 'att-102',
    dutyId: 'duty-002',
    dutyTitle: 'CS202 Midterm Exam Proctoring',
    studentId: 'usr-101',
    studentName: 'Alice Smith',
    date: '2026-07-27',
    status: 'Present',
    hoursCompleted: 3.0,
    notes: 'Exam invigilation completed without incident.',
    method: 'Manual',
  },
  {
    id: 'att-103',
    dutyId: 'duty-001',
    dutyTitle: 'CS101 Lab Supervision - Room 302',
    studentId: 'usr-102',
    studentName: 'Bob Johnson',
    date: '2026-07-26',
    status: 'Late',
    hoursCompleted: 1.5,
    notes: 'Arrived 15 mins late. Swiped RFID card.',
    rfidTag: 'RFID-2021-045',
    method: 'RFID_Scan',
    scanTimestamp: '09:15 AM',
  },
];

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);

  const markAttendance = useCallback((payload: MarkAttendancePayload): AttendanceRecord => {
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      method: payload.method || 'Manual',
      ...payload,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  }, []);

  const scanRfidCard = useCallback(
    (
      tag: string,
      duties: DutySlot[],
      studentsList: User[]
    ): { record: AttendanceRecord; student: User; duty: DutySlot } => {
      const cleanTag = tag.trim().toUpperCase();

      // Find matching student by RFID tag or Department ID or ID
      const student = studentsList.find(
        (s) =>
          s.department_id.toUpperCase() === cleanTag ||
          `RFID-${s.department_id}`.toUpperCase() === cleanTag ||
          s.id === cleanTag ||
          `RFID-${s.id}` === cleanTag ||
          (cleanTag.includes('001') && s.name.includes('Alice')) ||
          (cleanTag.includes('045') && s.name.includes('Bob')) ||
          (cleanTag.includes('089') && s.name.includes('Charlie')) ||
          (cleanTag.includes('112') && s.name.includes('Diana'))
      );

      if (!student) {
        throw new Error(`Unregistered RFID Badge UID '${tag}'. Card not provisioned in database.`);
      }

      // Find active duty assigned to this student
      const duty = duties.find((d) =>
        d.assignedStudents.some((st) => String(st.id) === String(student.id))
      ) || duties[0];

      if (!duty) {
        throw new Error(`No scheduled duty shift found for ${student.name} today.`);
      }

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const record: AttendanceRecord = {
        id: `att-${Date.now()}`,
        dutyId: duty.id,
        dutyTitle: duty.title,
        studentId: student.id,
        studentName: student.name,
        date: new Date().toISOString().slice(0, 10),
        status: 'Present',
        hoursCompleted: 2.0,
        notes: `Validated via RFID Hardware Sensor (${cleanTag}).`,
        rfidTag: cleanTag,
        method: 'RFID_Scan',
        scanTimestamp: nowStr,
      };

      setAttendanceRecords((prev) => [record, ...prev]);
      return { record, student, duty };
    },
    []
  );

  const getStudentAttendance = useCallback(
    (studentIdOrEmail: string) => {
      return attendanceRecords.filter(
        (rec) =>
          rec.studentId === studentIdOrEmail ||
          rec.studentName.toLowerCase().includes(studentIdOrEmail.toLowerCase())
      );
    },
    [attendanceRecords]
  );

  const getStudentTotalHours = useCallback(
    (studentIdOrEmail: string) => {
      const recs = getStudentAttendance(studentIdOrEmail);
      return recs.reduce(
        (sum, r) => sum + (r.status === 'Present' || r.status === 'Late' ? r.hoursCompleted : 0),
        0
      );
    },
    [getStudentAttendance]
  );

  return {
    attendanceRecords,
    markAttendance,
    scanRfidCard,
    getStudentAttendance,
    getStudentTotalHours,
  };
};
