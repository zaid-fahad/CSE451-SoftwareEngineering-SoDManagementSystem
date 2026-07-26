import { useState, useCallback } from 'react';
import { DutySlot, DutyCreateRequest, ScheduleConflict } from '../model/duty';
import { User } from '../model/user';
import { DayOfWeek } from '../model/schedule';
import { api } from './api';

// Sample candidate students available for manager assignment
export const MOCK_STUDENTS: User[] = [
  { id: 'st-101', department_id: '2021-1-60-001', name: 'Alice Smith', email: 'alice@univ.edu', role: 'Student' },
  { id: 'st-102', department_id: '2021-1-60-045', name: 'Bob Johnson', email: 'bob@univ.edu', role: 'Student' },
  { id: 'st-103', department_id: '2021-1-60-089', name: 'Charlie Brown', email: 'charlie@univ.edu', role: 'Student' },
  { id: 'st-104', department_id: '2021-1-60-112', name: 'Diana Prince', email: 'diana@univ.edu', role: 'Student' },
];

// Student schedule conflict rules matrix
const MOCK_STUDENT_SCHEDULES: Record<string, Record<string, { type: 'Class' | 'Busy'; courseCode?: string }>> = {
  'st-101': {
    'Monday-10:00 AM': { type: 'Class', courseCode: 'CSE451' },
    'Monday-11:00 AM': { type: 'Class', courseCode: 'CSE451' },
    'Monday-03:00 PM': { type: 'Busy' },
    'Wednesday-10:00 AM': { type: 'Class', courseCode: 'CSE451' },
  },
  'st-102': {
    'Tuesday-02:00 PM': { type: 'Class', courseCode: 'MAT211' },
    'Tuesday-03:00 PM': { type: 'Class', courseCode: 'MAT211' },
    'Thursday-02:00 PM': { type: 'Class', courseCode: 'MAT211' },
  },
  'st-103': {
    'Wednesday-02:00 PM': { type: 'Class', courseCode: 'PHY102' },
    'Friday-09:00 AM': { type: 'Class', courseCode: 'PHY102' },
    'Friday-10:00 AM': { type: 'Class', courseCode: 'PHY102' },
  },
  'st-104': {
    'Wednesday-02:00 PM': { type: 'Class', courseCode: 'ENG101' },
    'Friday-01:00 PM': { type: 'Busy' },
  },
};

const INITIAL_DUTIES: DutySlot[] = [
  {
    id: 'duty-1',
    title: 'Software Engineering Lab Assistance',
    location: 'Lab Room 302',
    day: 'Monday',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    type: 'LabDuty',
    maxStudents: 2,
    assignedStudents: [MOCK_STUDENTS[1]],
  },
  {
    id: 'duty-2',
    title: 'Linear Algebra Midterm Invigilation',
    location: 'Auditorium B',
    day: 'Wednesday',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    type: 'ExamDuty',
    maxStudents: 3,
    assignedStudents: [MOCK_STUDENTS[0]],
  },
  {
    id: 'duty-3',
    title: 'Department Hardware Inventory Duty',
    location: 'Store Room 104',
    day: 'Friday',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    type: 'GeneralDuty',
    maxStudents: 2,
    assignedStudents: [],
  },
];

export const useDuties = () => {
  const [duties, setDuties] = useState<DutySlot[]>(INITIAL_DUTIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check real-time schedule conflict for a student against a duty slot
  const checkStudentConflict = useCallback((studentId: string, day: DayOfWeek, startTime: string): ScheduleConflict => {
    const studentSchedule = MOCK_STUDENT_SCHEDULES[studentId];
    if (!studentSchedule) return { hasConflict: false };

    const slotKey = `${day}-${startTime}`;
    const conflict = studentSchedule[slotKey];

    if (conflict) {
      if (conflict.type === 'Class') {
        return {
          hasConflict: true,
          type: 'Class',
          conflictingCourse: conflict.courseCode || 'CLASS',
          timeSlot: `${day} ${startTime}`,
          reason: `Schedule Conflict: Has class '${conflict.courseCode || 'CLASS'}' on ${day} ${startTime}`,
        };
      } else {
        return {
          hasConflict: true,
          type: 'Busy',
          timeSlot: `${day} ${startTime}`,
          reason: `Schedule Conflict: Manual busy override on ${day} ${startTime}`,
        };
      }
    }

    return { hasConflict: false };
  }, []);

  const createDuty = useCallback(async (data: DutyCreateRequest): Promise<DutySlot> => {
    setIsLoading(true);
    try {
      const initialAssigned: User[] = [];
      if (data.assignedStudentId) {
        const student = MOCK_STUDENTS.find((s) => s.id === data.assignedStudentId);
        if (student) initialAssigned.push(student);
      }

      try {
        const res = await api.post<DutySlot>('/duties', data);
        const created = {
          ...res.data,
          assignedStudents: res.data.assignedStudents || initialAssigned,
        };
        setDuties((prev) => [created, ...prev]);
        return created;
      } catch {
        const newDuty: DutySlot = {
          id: `duty-${Date.now()}`,
          title: data.title,
          location: data.location,
          day: data.day,
          startTime: data.startTime,
          endTime: data.endTime,
          type: data.type,
          maxStudents: data.maxStudents,
          assignedStudents: initialAssigned,
        };
        setDuties((prev) => [newDuty, ...prev]);
        return newDuty;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assignStudent = useCallback((dutyId: string, student: User): boolean => {
    let success = false;
    setDuties((prev) =>
      prev.map((duty) => {
        if (duty.id === dutyId) {
          if (duty.assignedStudents.length >= duty.maxStudents) return duty;
          if (duty.assignedStudents.some((s) => s.id === student.id)) return duty;
          
          // Verify conflict guard
          const conflict = checkStudentConflict(student.id, duty.day, duty.startTime);
          if (conflict.hasConflict) return duty;

          success = true;
          return {
            ...duty,
            assignedStudents: [...duty.assignedStudents, student],
          };
        }
        return duty;
      })
    );
    return success;
  }, [checkStudentConflict]);

  const removeStudent = useCallback((dutyId: string, studentId: string) => {
    setDuties((prev) =>
      prev.map((duty) => {
        if (duty.id === dutyId) {
          return {
            ...duty,
            assignedStudents: duty.assignedStudents.filter((s) => s.id !== studentId),
          };
        }
        return duty;
      })
    );
  }, []);

  const deleteDuty = useCallback((dutyId: string) => {
    setDuties((prev) => prev.filter((d) => d.id !== dutyId));
  }, []);

  return {
    duties,
    isLoading,
    checkStudentConflict,
    createDuty,
    assignStudent,
    removeStudent,
    deleteDuty,
  };
};
