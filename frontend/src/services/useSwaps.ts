import { useState, useCallback } from 'react';
import { SwapRequest, SwapCreatePayload } from '../model/swap';
import { User } from '../model/user';
import { MOCK_STUDENTS } from './useDuties';
import { api } from './api';

const INITIAL_SWAPS: SwapRequest[] = [
  {
    id: 'swap-101',
    originalDutyId: 'duty-2',
    dutyTitle: 'Linear Algebra Midterm Invigilation',
    location: 'Auditorium B',
    day: 'Wednesday',
    time: '02:00 PM - 04:00 PM',
    requestingStudent: MOCK_STUDENTS[1], // Bob Johnson
    status: 'Pending',
    createdAt: 'Today at 09:30 AM',
    reason: 'Have an urgent lab makeup session',
  },
  {
    id: 'swap-102',
    originalDutyId: 'duty-3',
    dutyTitle: 'Department Hardware Inventory Duty',
    location: 'Store Room 104',
    day: 'Friday',
    time: '10:00 AM - 12:00 PM',
    requestingStudent: MOCK_STUDENTS[2], // Charlie Brown
    status: 'Pending',
    createdAt: 'Yesterday at 04:15 PM',
    reason: 'Family appointment conflict',
  },
  {
    id: 'swap-103',
    originalDutyId: 'duty-1',
    dutyTitle: 'Software Engineering Lab Assistance',
    location: 'Lab Room 302',
    day: 'Monday',
    time: '09:00 AM - 11:00 AM',
    requestingStudent: MOCK_STUDENTS[3], // Diana Prince
    acceptingStudent: MOCK_STUDENTS[0], // Alice Smith
    status: 'Accepted',
    createdAt: '2 days ago',
    reason: 'Schedule swap accepted',
  },
];

export const useSwaps = () => {
  const [swaps, setSwaps] = useState<SwapRequest[]>(INITIAL_SWAPS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const requestSwap = useCallback(async (payload: SwapCreatePayload, requestingUser: User): Promise<SwapRequest> => {
    setIsLoading(true);
    try {
      try {
        const res = await api.post<SwapRequest>('/swaps', payload);
        setSwaps((prev) => [res.data, ...prev]);
        return res.data;
      } catch {
        const newSwap: SwapRequest = {
          id: `swap-${Date.now()}`,
          originalDutyId: payload.originalDutyId,
          dutyTitle: payload.dutyTitle,
          location: payload.location,
          day: payload.day,
          time: payload.time,
          requestingStudent: requestingUser,
          status: 'Pending',
          createdAt: 'Just now',
          reason: payload.reason || 'Shift swap trade requested',
        };
        setSwaps((prev) => [newSwap, ...prev]);
        return newSwap;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptSwap = useCallback(async (swapId: string, acceptingUser: User): Promise<boolean> => {
    setIsLoading(true);
    let success = false;
    try {
      try {
        await api.post(`/swaps/${swapId}/accept`);
      } catch {
        // Local state fallback
      }
      setSwaps((prev) =>
        prev.map((s) => {
          if (s.id === swapId && s.status === 'Pending') {
            success = true;
            return {
              ...s,
              acceptingStudent: acceptingUser,
              status: 'Accepted',
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
    return success;
  }, []);

  const cancelSwap = useCallback((swapId: string) => {
    setSwaps((prev) =>
      prev.map((s) => {
        if (s.id === swapId) {
          return { ...s, status: 'Cancelled' };
        }
        return s;
      })
    );
  }, []);

  return {
    swaps,
    isLoading,
    requestSwap,
    acceptSwap,
    cancelSwap,
  };
};
