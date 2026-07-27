import { useState, useCallback, useEffect } from 'react';
import { DutySlot, DutyCreateRequest, ScheduleConflict } from '../model/duty';
import { User } from '../model/user';
import { DayOfWeek } from '../model/schedule';
import { api } from './api';

// Export MOCK_STUDENTS to maintain backwards compatibility and prevent typescript failures in other modules
export const MOCK_STUDENTS: User[] = [
  { id: '1', department_id: '2021-1-60-001', name: 'Alice Smith', email: 'alice@univ.edu', role: 'Student' },
  { id: '2', department_id: '2021-1-60-045', name: 'Bob Johnson', email: 'bob@univ.edu', role: 'Student' },
  { id: '3', department_id: '2021-1-60-089', name: 'Charlie Brown', email: 'charlie@univ.edu', role: 'Student' },
  { id: '4', department_id: '2021-1-60-112', name: 'Diana Prince', email: 'diana@univ.edu', role: 'Student' },
];

const convertTo24h = (time12h: string): string => {
  const parts = time12h.split(' ');
  const time = parts[0];
  const ampm = parts[1];
  let hour = parseInt(time.split(':')[0], 10);
  const minute = time.split(':')[1];

  if (ampm === 'PM' && hour !== 12) {
    hour += 12;
  } else if (ampm === 'AM' && hour === 12) {
    hour = 0;
  }
  return `${String(hour).padStart(2, '0')}:${minute}`;
};

const convertTo12h = (time24h: string): string => {
  const parts = time24h.split(':');
  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
};

const getNextDateForDay = (dayName: string): string => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const todayIndex = today.getDay();
  const targetIndex = daysOfWeek.indexOf(dayName);

  let daysToAdd = targetIndex - todayIndex;
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }

  const targetDate = new Date();
  targetDate.setDate(today.getDate() + daysToAdd);

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const mapBackendDutyToFrontend = (d: any, allStudents: User[]): DutySlot => {
  const student = allStudents.find((s) => String(s.id) === String(d.assigned_student_id));
  const assignedStudents = student ? [student] : [];

  let location = 'Lab Room 302';
  let type: any = 'LabDuty';
  let assignedFaculty = 'Dr. Sarah Connor (Faculty)';

  if (d.notes) {
    try {
      const parsedNotes = JSON.parse(d.notes);
      location = parsedNotes.location || location;
      type = parsedNotes.type || type;
      assignedFaculty = parsedNotes.assignedFaculty || assignedFaculty;
    } catch {
      location = d.notes;
    }
  }

  return {
    id: String(d.id),
    title: d.title,
    location,
    day: d.day_of_week as DayOfWeek,
    startTime: convertTo12h(d.start_time),
    endTime: convertTo12h(d.end_time),
    type,
    maxStudents: 2,
    assignedStudents,
    assignedFaculty,
  };
};

export const useDuties = () => {
  const [duties, setDuties] = useState<DutySlot[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const studRes = await api.get('/auth/students');
      const fetchedStudents = studRes.data.map((s: any) => ({
        id: String(s.id),
        department_id: s.department_id,
        name: s.name,
        email: s.email,
        role: s.role,
      }));
      setStudents(fetchedStudents);

      const res = await api.get('/tasks');
      const mapped = res.data.map((d: any) => mapBackendDutyToFrontend(d, fetchedStudents));
      setDuties(mapped);
    } catch (err) {
      console.error('Failed to load duties and students from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('sod_token');
    if (token) {
      refreshData();
    }
  }, [refreshData]);

  const checkStudentConflict = useCallback(
    async (studentId: string, day: DayOfWeek, startTime: string, endTime: string): Promise<ScheduleConflict> => {
      try {
        const res = await api.get(`/schedule/student/${studentId}`);
        const dbSlots = res.data;
        const start24 = convertTo24h(startTime);
        const end24 = convertTo24h(endTime);

        const match = dbSlots.find(
          (dbSlot: any) =>
            dbSlot.day_of_week === day &&
            dbSlot.start_time < end24 &&
            dbSlot.end_time > start24
        );

        if (match) {
          if (match.is_override) {
            return {
              hasConflict: true,
              type: 'Busy',
              timeSlot: `${day} ${startTime}-${endTime}`,
              reason: `Manual busy override on ${day} ${startTime}-${endTime}`,
            };
          } else {
            return {
              hasConflict: true,
              type: 'Class',
              conflictingCourse: match.course_code || 'CLASS',
              timeSlot: `${day} ${startTime}-${endTime}`,
              reason: `Has class '${match.course_code}' on ${day} ${startTime}-${endTime}`,
            };
          }
        }
      } catch (err) {
        console.error('Failed to check conflict on backend:', err);
      }
      return { hasConflict: false };
    },
    []
  );

  const createDuty = useCallback(
    async (data: DutyCreateRequest): Promise<DutySlot> => {
      setIsLoading(true);
      const date = getNextDateForDay(data.day);
      const start_time = convertTo24h(data.startTime);
      const end_time = convertTo24h(data.endTime);
      
      const notesJson = JSON.stringify({
        location: data.location,
        type: data.type,
        assignedFaculty: data.assignedFaculty || 'Dr. Sarah Connor (Faculty)',
      });

      try {
        const res = await api.post('/tasks', {
          title: data.title,
          date,
          start_time,
          end_time,
          assigned_student_id: data.assignedStudentId ? Number(data.assignedStudentId) : null,
          notes: notesJson,
        });

        await refreshData();
        return mapBackendDutyToFrontend(res.data, students);
      } catch (err: any) {
        const errMsg = err.response?.data?.detail;
        if (errMsg && errMsg.code === 'CONFLICT_DETECTED') {
          throw new Error(
            `CONFLICT: Student has class '${errMsg.detail.course}' during this time slot (${errMsg.detail.time}).`
          );
        }
        throw new Error(err.response?.data?.detail || 'Failed to create duty slot.');
      } finally {
        setIsLoading(false);
      }
    },
    [students, refreshData]
  );

  const assignStudent = useCallback(
    async (dutyId: string, student: User): Promise<boolean> => {
      setIsLoading(true);
      try {
        await api.patch(`/tasks/${dutyId}`, {
          assigned_student_id: Number(student.id),
        });
        await refreshData();
        return true;
      } catch (err: any) {
        const errMsg = err.response?.data?.detail;
        if (errMsg && errMsg.code === 'CONFLICT_DETECTED') {
          alert(`CONFLICT DETECTED: ${student.name} has class ${errMsg.detail.course} during this time (${errMsg.detail.time}).`);
        } else {
          alert(err.response?.data?.detail || 'Failed to assign student.');
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshData]
  );

  const removeStudent = useCallback(
    async (dutyId: string, _studentId: string) => {
      setIsLoading(true);
      try {
        await api.patch(`/tasks/${dutyId}`, {
          assigned_student_id: null,
        });
        await refreshData();
      } catch (err) {
        console.error('Failed to remove student:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshData]
  );

  const deleteDuty = useCallback(
    async (dutyId: string) => {
      setIsLoading(true);
      try {
        await api.delete(`/tasks/${dutyId}`);
        await refreshData();
      } catch (err) {
        console.error('Failed to delete duty:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshData]
  );

  return {
    duties,
    students,
    isLoading,
    checkStudentConflict,
    createDuty,
    assignStudent,
    removeStudent,
    deleteDuty,
    refreshData,
  };
};
