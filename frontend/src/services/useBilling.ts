import { useState, useCallback } from 'react';
import { BillItem, BillSubmitPayload } from '../model/billing';
import { User } from '../model/user';
import { MOCK_STUDENTS } from './useDuties';
import { api } from './api';

const HOURLY_RATE = 15.0; // $15.00 / hour standard student duty rate

const INITIAL_BILLS: BillItem[] = [
  {
    id: 'bill-101',
    studentId: MOCK_STUDENTS[0].id,
    studentName: MOCK_STUDENTS[0].name,
    departmentId: MOCK_STUDENTS[0].department_id,
    month: 'July 2026',
    hoursCompleted: 24,
    hourlyRate: HOURLY_RATE,
    totalPayout: 24 * HOURLY_RATE, // $360.00
    state: 'Faculty_Verified',
    submittedAt: 'Jul 20, 2026',
    verifiedByFaculty: 'Dr. Sarah Connor (Faculty)',
  },
  {
    id: 'bill-102',
    studentId: MOCK_STUDENTS[1].id,
    studentName: MOCK_STUDENTS[1].name,
    departmentId: MOCK_STUDENTS[1].department_id,
    month: 'July 2026',
    hoursCompleted: 18,
    hourlyRate: HOURLY_RATE,
    totalPayout: 18 * HOURLY_RATE, // $270.00
    state: 'Submitted',
    submittedAt: 'Jul 22, 2026',
  },
  {
    id: 'bill-103',
    studentId: MOCK_STUDENTS[2].id,
    studentName: MOCK_STUDENTS[2].name,
    departmentId: MOCK_STUDENTS[2].department_id,
    month: 'June 2026',
    hoursCompleted: 30,
    hourlyRate: HOURLY_RATE,
    totalPayout: 30 * HOURLY_RATE, // $450.00
    state: 'Manager_Approved',
    submittedAt: 'Jun 28, 2026',
    verifiedByFaculty: 'Dr. Sarah Connor (Faculty)',
    approvedByManager: 'Prof. Alan Turing (Dept Manager)',
  },
  {
    id: 'bill-104',
    studentId: MOCK_STUDENTS[3].id,
    studentName: MOCK_STUDENTS[3].name,
    departmentId: MOCK_STUDENTS[3].department_id,
    month: 'July 2026',
    hoursCompleted: 12,
    hourlyRate: HOURLY_RATE,
    totalPayout: 12 * HOURLY_RATE, // $180.00
    state: 'Disputed',
    submittedAt: 'Jul 15, 2026',
    disputeReason: 'Unverified lab log entry on July 14th',
  },
];

export const useBilling = () => {
  const [bills, setBills] = useState<BillItem[]>(INITIAL_BILLS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const submitBill = useCallback(async (user: User, payload: BillSubmitPayload): Promise<BillItem> => {
    setIsLoading(true);
    try {
      try {
        const res = await api.post<BillItem>('/billing/submit', payload);
        setBills((prev) => [res.data, ...prev]);
        return res.data;
      } catch {
        const newBill: BillItem = {
          id: `bill-${Date.now()}`,
          studentId: user.id,
          studentName: user.name,
          departmentId: user.department_id,
          month: payload.month,
          hoursCompleted: payload.hoursCompleted,
          hourlyRate: HOURLY_RATE,
          totalPayout: payload.hoursCompleted * HOURLY_RATE,
          state: 'Submitted',
          submittedAt: 'Just now',
        };
        setBills((prev) => [newBill, ...prev]);
        return newBill;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyByFaculty = useCallback(async (billId: string, facultyName: string) => {
    setIsLoading(true);
    try {
      try {
        await api.post(`/billing/${billId}/faculty-verify`);
      } catch {
        // Fallback
      }
      setBills((prev) =>
        prev.map((b) => {
          if (b.id === billId) {
            return {
              ...b,
              state: 'Faculty_Verified',
              verifiedByFaculty: facultyName,
            };
          }
          return b;
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveByManager = useCallback(async (billId: string, managerName: string) => {
    setIsLoading(true);
    try {
      try {
        await api.post(`/billing/${billId}/manager-approve`);
      } catch {
        // Fallback
      }
      setBills((prev) =>
        prev.map((b) => {
          if (b.id === billId) {
            return {
              ...b,
              state: 'Manager_Approved',
              approvedByManager: managerName,
            };
          }
          return b;
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disputeBill = useCallback(async (billId: string, reason: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          return {
            ...b,
            state: 'Disputed',
            disputeReason: reason || 'Disputed during verification',
          };
        }
        return b;
      })
    );
  }, []);

  return {
    bills,
    isLoading,
    submitBill,
    verifyByFaculty,
    approveByManager,
    disputeBill,
  };
};
