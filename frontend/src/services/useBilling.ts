import { useState, useCallback, useEffect } from 'react';
import { BillItem, BillSubmitPayload } from '../model/billing';
import { User } from '../model/user';
import { api } from './api';

const mapBackendClaimToFrontend = (b: any, studentsList: User[]): BillItem => {
  const student = studentsList.find((s) => String(s.id) === String(b.student_id));
  
  let state: any = 'Submitted';
  if (b.status === 'Verified') state = 'Faculty_Verified';
  if (b.status === 'Approved') state = 'Manager_Approved';
  if (b.status === 'Paid') state = 'Paid';
  if (b.status === 'Rejected') state = 'Disputed';

  return {
    id: String(b.id),
    studentId: String(b.student_id),
    studentName: student ? student.name : 'Unknown Student',
    departmentId: student ? student.department_id : 'N/A',
    month: b.month,
    weekNumber: b.week_number || undefined,
    hoursCompleted: b.hours_logged,
    hourlyRate: b.hourly_rate,
    totalPayout: b.amount,
    state,
    submittedAt: b.created_at,
    verifiedByFaculty: b.verified_by || (b.status === 'Verified' || b.status === 'Approved' || b.status === 'Paid' ? 'Verified by Supervisor' : undefined),
    verifiedAt: b.verified_at || undefined,
    approvedByManager: b.approved_by || (b.status === 'Approved' || b.status === 'Paid' ? 'Approved by Dept Head' : undefined),
    approvedAt: b.approved_at || undefined,
    paidBy: b.paid_by || undefined,
    paidAt: b.paid_at || undefined,
    disputeReason: b.dispute_reason || undefined,
    semester: b.semester || undefined,
  };
};

export const useBilling = () => {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshClaims = useCallback(async (semesterFilter?: string) => {
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

      const res = await api.get('/billing/claims', {
        params: semesterFilter ? { semester: semesterFilter } : {},
      });
      const mapped = res.data.map((b: any) => mapBackendClaimToFrontend(b, fetchedStudents));
      setBills(mapped);
    } catch (err) {
      console.error('Failed to fetch billing claims from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('sod_token');
    if (token) {
      refreshClaims();
    }
  }, [refreshClaims]);

  const submitBill = useCallback(
    async (user: User, payload: BillSubmitPayload): Promise<BillItem> => {
      setIsLoading(true);
      try {
        const res = await api.post('/billing/submit', {
          month: payload.month,
          hours_logged: payload.hoursCompleted,
          hourly_rate: 150.0, // standard rate
          semester: payload.semester || undefined,
        });
        await refreshClaims();
        return mapBackendClaimToFrontend(res.data, [user]);
      } catch (err: any) {
        throw new Error(err.response?.data?.detail || 'Failed to submit billing claim.');
      } finally {
        setIsLoading(false);
      }
    },
    [refreshClaims]
  );

  const verifyByFaculty = useCallback(
    async (billId: string, _facultyName: string) => {
      setIsLoading(true);
      try {
        await api.post(`/billing/${billId}/approve?action=verify`);
        await refreshClaims();
      } catch (err) {
        console.error('Failed to verify bill:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshClaims]
  );

  const approveByManager = useCallback(
    async (billId: string, _managerName: string) => {
      setIsLoading(true);
      try {
        await api.post(`/billing/${billId}/approve?action=approve`);
        await refreshClaims();
      } catch (err) {
        console.error('Failed to approve bill:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshClaims]
  );

  const disputeBill = useCallback(
    async (billId: string, reason: string) => {
      setIsLoading(true);
      try {
        await api.post(`/billing/${billId}/approve?action=reject&reason=${encodeURIComponent(reason)}`);
        await refreshClaims();
      } catch (err: any) {
        console.error('Failed to dispute bill:', err);
        throw new Error(err.response?.data?.detail || 'Failed to dispute bill.');
      } finally {
        setIsLoading(false);
      }
    },
    [refreshClaims]
  );

  const directPayout = useCallback(
    async (billId: string) => {
      setIsLoading(true);
      try {
        await api.post(`/billing/claims/${billId}/direct-payout`);
        await refreshClaims();
      } catch (err: any) {
        console.error('Failed to direct payout bill:', err);
        throw new Error(err.response?.data?.detail || 'Failed to direct payout bill.');
      } finally {
        setIsLoading(false);
      }
    },
    [refreshClaims]
  );

  const createManualBill = useCallback(
    async (payload: { studentId: string; month: string; weekNumber?: number; hoursCompleted: number; hourlyRate?: number; semester?: string }) => {
      setIsLoading(true);
      try {
        await api.post('/billing/manual', {
          student_id: parseInt(payload.studentId, 10),
          month: payload.month,
          week_number: payload.weekNumber,
          hours_logged: payload.hoursCompleted,
          hourly_rate: payload.hourlyRate || 150.0,
          semester: payload.semester || undefined,
        });
        await refreshClaims();
      } catch (err: any) {
        console.error('Failed to create manual bill:', err);
        throw new Error(err.response?.data?.detail || 'Failed to create manual bill.');
      } finally {
        setIsLoading(false);
      }
    },
    [refreshClaims]
  );

  const exportPayrollCsv = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/billing/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export payroll report:', err);
      alert('Failed to export payroll CSV report.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    bills,
    isLoading,
    submitBill,
    createManualBill,
    verifyByFaculty,
    approveByManager,
    directPayout,
    disputeBill,
    exportPayrollCsv,
    refreshClaims,
  };
};
