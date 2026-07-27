import { useState, useCallback, useEffect } from 'react';
import { BillItem, BillSubmitPayload } from '../model/billing';
import { User } from '../model/user';
import { api } from './api';

const mapBackendClaimToFrontend = (b: any, studentsList: User[]): BillItem => {
  const student = studentsList.find((s) => String(s.id) === String(b.student_id));
  
  let state: any = 'Submitted';
  if (b.status === 'Verified') state = 'Faculty_Verified';
  if (b.status === 'Approved' || b.status === 'Paid') state = 'Manager_Approved';
  if (b.status === 'Rejected') state = 'Disputed';

  return {
    id: String(b.id),
    studentId: String(b.student_id),
    studentName: student ? student.name : 'Unknown Student',
    departmentId: student ? student.department_id : 'N/A',
    month: b.month,
    hoursCompleted: b.hours_logged,
    hourlyRate: b.hourly_rate,
    totalPayout: b.amount,
    state,
    submittedAt: b.created_at,
    verifiedByFaculty: b.status === 'Verified' || b.status === 'Approved' || b.status === 'Paid' ? 'Verified by Supervisor' : undefined,
    approvedByManager: b.status === 'Approved' || b.status === 'Paid' ? 'Approved by Dept Head' : undefined,
  };
};

export const useBilling = () => {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshClaims = useCallback(async () => {
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

      const res = await api.get('/billing/claims');
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
    async (billId: string, _reason: string) => {
      setIsLoading(true);
      try {
        await api.post(`/billing/${billId}/approve?action=reject`);
        // Save dispute details in local storage or notes if necessary
        await refreshClaims();
      } catch (err) {
        console.error('Failed to dispute bill:', err);
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
    verifyByFaculty,
    approveByManager,
    disputeBill,
    exportPayrollCsv,
    refreshClaims,
  };
};
