import { useState, useCallback } from 'react';
import { DutySlot, DutyCreateRequest } from '../model/duty';
import { User } from '../model/user';
import { api } from './api';

// Sample candidate students available for manager assignment
export const MOCK_STUDENTS: User[] = [
  { id: 'st-101', department_id: '2021-1-60-001', name: 'Alice Smith', email: 'alice@univ.edu', role: 'Student' },
  { id: 'st-102', department_id: '2021-1-60-045', name: 'Bob Johnson', email: 'bob@univ.edu', role: 'Student' },
  { id: 'st-103', department_id: '2021-1-60-089', name: 'Charlie Brown', email: 'charlie@univ.edu', role: 'Student' },
  { id: 'st-104', department_id: '2021-1-60-112', name: 'Diana Prince', email: 'diana@univ.edu', role: 'Student' },
];

const INITIAL_DUTIES: DutySlot[] = [
  {
    id: 'duty-1',
    title: 'Software Engineering Lab Assistance',
    location: 'Lab Room 302',
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    type: 'LabDuty',
    maxStudents: 2,
    assignedStudents: [MOCK_STUDENTS[0]],
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
    assignedStudents: [MOCK_STUDENTS[1], MOCK_STUDENTS[2]],
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

  const createDuty = useCallback(async (data: DutyCreateRequest): Promise<DutySlot> => {
    setIsLoading(true);
    try {
      try {
        const res = await api.post<DutySlot>('/duties', data);
        setDuties((prev) => [res.data, ...prev]);
        return res.data;
      } catch {
        const newDuty: DutySlot = {
          id: `duty-${Date.now()}`,
          ...data,
          assignedStudents: [],
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
  }, []);

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
    createDuty,
    assignStudent,
    removeStudent,
    deleteDuty,
  };
};
