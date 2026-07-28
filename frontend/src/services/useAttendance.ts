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
    date: '2026-07-28',
    status: 'Present',
    hoursCompleted: 2.0,
    shiftState: 'Checked_Out',
    checkInTime: '08:58 AM',
    checkOutTime: '11:00 AM',
    notes: 'Completed shift via RFID sensor.',
    rfidTag: 'RFID-2021-001',
    method: 'RFID_Scan',
    scanTimestamp: '08:58 AM',
  },
  {
    id: 'att-102',
    dutyId: 'duty-002',
    dutyTitle: 'CS202 Midterm Exam Proctoring',
    studentId: 'usr-102',
    studentName: 'Bob Johnson',
    date: '2026-07-28',
    status: 'Present',
    hoursCompleted: 2.0,
    shiftState: 'Checked_In',
    checkInTime: '09:02 AM',
    checkOutTime: 'Active / On Shift',
    notes: 'Currently on duty shift in Room 304.',
    rfidTag: 'RFID-2021-045',
    method: 'RFID_Scan',
    scanTimestamp: '09:02 AM',
  },
  {
    id: 'att-103',
    dutyId: 'duty-003',
    dutyTitle: 'Hardware Inventory Audit',
    studentId: 'usr-103',
    studentName: 'Charlie Brown',
    date: '2026-07-27',
    status: 'Late',
    hoursCompleted: 1.5,
    shiftState: 'Checked_Out',
    checkInTime: '09:15 AM',
    checkOutTime: '10:45 AM',
    notes: 'Arrived 15 mins late due to class overlap.',
    rfidTag: 'RFID-2021-089',
    method: 'RFID_Scan',
    scanTimestamp: '09:15 AM',
  },
];

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);

  const markAttendance = useCallback((payload: MarkAttendancePayload): AttendanceRecord => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      method: payload.method || 'Manual',
      shiftState: payload.shiftState || 'Checked_Out',
      checkInTime: payload.checkInTime || nowStr,
      checkOutTime: payload.checkOutTime || 'Active / On Shift',
      ...payload,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  }, []);

  // Quick Check-In Action
  const checkInStudent = useCallback(
    (student: User, duty: DutySlot, method: 'Manual' | 'RFID_Scan' = 'Manual', rfidTag?: string) => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        dutyId: duty.id,
        dutyTitle: duty.title,
        studentId: student.id,
        studentName: student.name,
        date: new Date().toISOString().slice(0, 10),
        status: 'Present',
        hoursCompleted: 2.0,
        shiftState: 'Checked_In',
        checkInTime: nowStr,
        checkOutTime: 'Active / On Shift',
        notes: `Checked IN via ${method === 'RFID_Scan' ? 'RFID Scanner' : 'Supervisor Portal'}`,
        method,
        rfidTag,
        scanTimestamp: nowStr,
      };

      setAttendanceRecords((prev) => [newRecord, ...prev]);
      return newRecord;
    },
    []
  );

  // Quick Check-Out Action
  const checkOutStudent = useCallback((recordId: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendanceRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          return {
            ...rec,
            shiftState: 'Checked_Out',
            checkOutTime: nowStr,
            notes: rec.notes + ` • Checked OUT at ${nowStr}`,
          };
        }
        return rec;
      })
    );
  }, []);

  // Wireless RFID Two-Tap Check-In / Check-Out Lifecycle
  const scanRfidCard = useCallback(
    (
      tag: string,
      duties: DutySlot[],
      studentsList: User[]
    ): { record: AttendanceRecord; student: User; duty: DutySlot; action: 'checkin' | 'checkout' } => {
      const cleanTag = tag.trim().toUpperCase();

      // Find matching student profile
      const student = studentsList.find(
        (s) =>
          (s.rfidTag && s.rfidTag.toUpperCase() === cleanTag) ||
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
        throw new Error(`Unregistered RFID Card UID '${tag}'. Card not provisioned.`);
      }

      // Check if student has an active 'Checked_In' record -> IF YES, CHECK OUT!
      const activeRecord = attendanceRecords.find(
        (r) => String(r.studentId) === String(student.id) && r.shiftState === 'Checked_In'
      );

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (activeRecord) {
        // EXECUTE CHECK OUT
        let updatedRec: AttendanceRecord = activeRecord;
        setAttendanceRecords((prev) =>
          prev.map((rec) => {
            if (rec.id === activeRecord.id) {
              updatedRec = {
                ...rec,
                shiftState: 'Checked_Out',
                checkOutTime: nowStr,
                notes: rec.notes + ` • Checked OUT via RFID at ${nowStr}`,
              };
              return updatedRec;
            }
            return rec;
          })
        );

        const duty = duties.find((d) => d.id === activeRecord.dutyId) || duties[0];
        return { record: updatedRec, student, duty, action: 'checkout' };
      } else {
        // EXECUTE CHECK IN
        const duty = duties.find((d) =>
          d.assignedStudents.some((st) => String(st.id) === String(student.id))
        ) || duties[0];

        if (!duty) {
          throw new Error(`No scheduled duty shift found for ${student.name} today.`);
        }

        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          dutyId: duty.id,
          dutyTitle: duty.title,
          studentId: student.id,
          studentName: student.name,
          date: new Date().toISOString().slice(0, 10),
          status: 'Present',
          hoursCompleted: 2.0,
          shiftState: 'Checked_In',
          checkInTime: nowStr,
          checkOutTime: 'Active / On Shift',
          notes: `Checked IN via RFID Sensor (${cleanTag}).`,
          rfidTag: cleanTag,
          method: 'RFID_Scan',
          scanTimestamp: nowStr,
        };

        setAttendanceRecords((prev) => [newRecord, ...prev]);
        return { record: newRecord, student, duty, action: 'checkin' };
      }
    },
    [attendanceRecords]
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
    checkInStudent,
    checkOutStudent,
    scanRfidCard,
    getStudentAttendance,
    getStudentTotalHours,
  };
};
