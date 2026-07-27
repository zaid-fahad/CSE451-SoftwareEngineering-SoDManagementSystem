import { useState, useCallback, useEffect } from 'react';
import { SwapRequest, SwapCreatePayload } from '../model/swap';
import { User } from '../model/user';
import { DayOfWeek } from '../model/schedule';
import { api } from './api';

// Convert 24-hour time to 12-hour AM/PM time
const convertTo12h = (time24h: string): string => {
  const parts = time24h.split(':');
  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
};

// Mapper between backend schemas and frontend interfaces
const mapBackendSwapToFrontend = (
  s: any,
  dutiesList: any[],
  studentsList: User[]
): SwapRequest | null => {
  // Find linked duty
  const duty = dutiesList.find((d) => String(d.id) === String(s.duty_id));
  if (!duty) return null;

  // Find requester student
  const requester = studentsList.find((stud) => String(stud.id) === String(s.requester_id));
  if (!requester) return null;

  // Find target/accepting student
  const accepting = studentsList.find((stud) => String(stud.id) === String(s.target_student_id));

  let status: any = 'Pending';
  if (s.status === 'Accepted') status = 'Accepted';
  if (s.status === 'Rejected') status = 'Cancelled';

  // Map notes/location
  let location = 'Lab Room 302';
  if (duty.notes) {
    try {
      const parsedNotes = JSON.parse(duty.notes);
      location = parsedNotes.location || location;
    } catch {
      location = duty.notes;
    }
  }

  return {
    id: String(s.id),
    originalDutyId: String(duty.id),
    dutyTitle: duty.title,
    location,
    day: duty.day_of_week as DayOfWeek,
    time: `${convertTo12h(duty.start_time)} - ${convertTo12h(duty.end_time)}`,
    requestingStudent: requester,
    acceptingStudent: accepting || undefined,
    status,
    createdAt: s.created_at,
    reason: s.reason,
  };
};

export const useSwaps = () => {
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshSwaps = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch students
      const studRes = await api.get('/auth/students');
      const fetchedStudents = studRes.data.map((s: any) => ({
        id: String(s.id),
        department_id: s.department_id,
        name: s.name,
        email: s.email,
        role: s.role,
      }));

      // 2. Fetch duties
      const dutyRes = await api.get('/tasks');
      
      // 3. Fetch swaps
      const swapRes = await api.get('/swaps');
      
      // 4. Map them together
      const mapped: SwapRequest[] = [];
      swapRes.data.forEach((s: any) => {
        const item = mapBackendSwapToFrontend(s, dutyRes.data, fetchedStudents);
        if (item) mapped.push(item);
      });

      setSwaps(mapped);
    } catch (err) {
      console.error('Failed to load swaps from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('sod_token');
    if (token) {
      refreshSwaps();
    }
  }, [refreshSwaps]);

  const requestSwap = useCallback(
    async (payload: SwapCreatePayload, _requestingUser: User): Promise<SwapRequest> => {
      setIsLoading(true);
      try {
        const res = await api.post('/swaps/request', {
          duty_id: Number(payload.originalDutyId),
          reason: payload.reason,
        });

        await refreshSwaps();
        
        // Return dummy or newly mapped item
        const studentsRes = await api.get('/auth/students');
        const dutyRes = await api.get('/tasks');
        const mapped = mapBackendSwapToFrontend(res.data, dutyRes.data, studentsRes.data);
        if (!mapped) throw new Error('Mapping failed.');
        return mapped;
      } catch (err: any) {
        throw new Error(err.response?.data?.detail || 'Failed to request shift swap.');
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSwaps]
  );

  const acceptSwap = useCallback(
    async (swapId: string, _acceptingUser: User): Promise<boolean> => {
      setIsLoading(true);
      try {
        await api.post(`/swaps/${swapId}/respond?approve=true`);
        await refreshSwaps();
        return true;
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to accept swap request.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSwaps]
  );

  const cancelSwap = useCallback(
    async (swapId: string) => {
      setIsLoading(true);
      try {
        await api.post(`/swaps/${swapId}/respond?approve=false`);
        await refreshSwaps();
      } catch (err) {
        console.error('Failed to cancel swap request:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSwaps]
  );

  return {
    swaps,
    isLoading,
    requestSwap,
    acceptSwap,
    cancelSwap,
    refreshSwaps,
  };
};
