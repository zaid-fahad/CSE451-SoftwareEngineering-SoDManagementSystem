import { useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '../model/user';
import { MOCK_STUDENTS } from './useDuties';
import { api } from './api';

const INITIAL_USERS: User[] = [
  ...MOCK_STUDENTS.map((s) => ({ ...s, isActive: true, rfidTag: s.rfidTag || `RFID-${s.department_id}` })),
  { id: 'usr-201', department_id: 'FAC-001', name: 'Dr. Sarah Connor', email: 'sarah.connor@univ.edu', role: 'Faculty', isActive: true, rfidTag: 'RFID-FAC-001' },
  { id: 'usr-202', department_id: 'FAC-002', name: 'Prof. Alan Turing', email: 'alan.turing@univ.edu', role: 'Faculty', isActive: true, rfidTag: 'RFID-FAC-002' },
  { id: 'usr-301', department_id: 'MGR-001', name: 'James Vance', email: 'james.vance@univ.edu', role: 'LabManager', isActive: true, rfidTag: 'RFID-MGR-001' },
  { id: 'usr-401', department_id: 'DMGR-001', name: 'Dr. Robert Oppenheimer', email: 'robert.oppenheimer@univ.edu', role: 'DeptManager', isActive: true, rfidTag: 'RFID-DMGR-001' },
];

export interface AddUserPayload {
  name: string;
  email: string;
  department_id: string;
  role: UserRole;
  rfidTag?: string;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  department_id: string;
  role: UserRole;
  isActive: boolean;
  rfidTag?: string;
  weekly_hours_limit?: number;
  approval_status?: 'Pending' | 'Approved' | 'Rejected';
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [pendingStudents, setPendingStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/auth/users');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setUsers(res.data.map((u: any) => ({
          id: String(u.id),
          department_id: u.department_id,
          name: u.name,
          email: u.email,
          role: u.role,
          isActive: u.is_active,
          rfidTag: u.rfid_tag || `RFID-${u.department_id}`,
          weekly_hours_limit: u.weekly_hours_limit ?? 10.0,
          approval_status: u.approval_status ?? 'Approved',
        })));
      }
    } catch (err) {
      console.warn('Backend /auth/users not accessible or mock fallback in use:', err);
    }
  }, []);

  const addUser = useCallback(async (payload: AddUserPayload): Promise<User> => {
    setIsLoading(true);
    try {
      try {
        const res = await api.post<User>('/users', payload);
        setUsers((prev) => [res.data, ...prev]);
        return res.data;
      } catch {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          department_id: payload.department_id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          isActive: true,
          rfidTag: payload.rfidTag || `RFID-${payload.department_id}`,
          weekly_hours_limit: 10.0,
          approval_status: 'Approved',
        };
        setUsers((prev) => [newUser, ...prev]);
        return newUser;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, payload: UpdateUserPayload) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...payload } : u))
    );
    const numericId = parseInt(userId, 10);
    if (!isNaN(numericId)) {
      try {
        await api.put(`/auth/users/${numericId}`, {
          name: payload.name,
          email: payload.email,
          department_id: payload.department_id,
          role: payload.role,
          is_active: payload.isActive,
          rfid_tag: payload.rfidTag,
          weekly_hours_limit: payload.weekly_hours_limit,
        });
      } catch (err) {
        console.warn('Backend update user error (state kept in UI):', err);
      }
    }
  }, []);

  const assignRfidToUser = useCallback((userId: string, rfidTag: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, rfidTag: rfidTag.trim().toUpperCase() } : u))
    );
  }, []);

  const toggleUserStatus = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: u.isActive === false } : u))
    );
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const resetUserPassword = useCallback(async (userId: string, newPassword: string): Promise<void> => {
    const numericId = parseInt(userId, 10);
    if (!isNaN(numericId)) {
      try {
        await api.post(`/auth/users/${numericId}/reset-password`, { new_password: newPassword });
      } catch (err) {
        console.warn('Backend reset password error (continuing with simulated state):', err);
      }
    }
  }, []);

  const fetchPendingStudents = useCallback(async () => {
    try {
      const res = await api.get('/auth/pending-students');
      if (Array.isArray(res.data)) {
        setPendingStudents(res.data.map((u: any) => ({
          id: String(u.id),
          department_id: u.department_id,
          name: u.name,
          email: u.email,
          role: u.role,
          isActive: u.is_active,
          rfidTag: u.rfid_tag || `RFID-${u.department_id}`,
          weekly_hours_limit: u.weekly_hours_limit ?? 10.0,
          approval_status: u.approval_status ?? 'Pending',
        })));
      }
    } catch (err) {
      console.warn('Backend /auth/pending-students fetch error:', err);
    }
  }, []);

  const approveStudent = useCallback(async (userId: string, weeklyHoursLimit: number = 10.0) => {
    const numericId = parseInt(userId, 10);
    if (!isNaN(numericId)) {
      await api.post(`/auth/students/${numericId}/approve?weekly_hours_limit=${weeklyHoursLimit}`);
    }
    setPendingStudents((prev) => prev.filter((s) => s.id !== userId));
    await fetchUsers();
  }, [fetchUsers]);

  const rejectStudent = useCallback(async (userId: string) => {
    const numericId = parseInt(userId, 10);
    if (!isNaN(numericId)) {
      await api.post(`/auth/students/${numericId}/reject`);
    }
    setPendingStudents((prev) => prev.filter((s) => s.id !== userId));
    await fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
    fetchPendingStudents();
  }, [fetchUsers, fetchPendingStudents]);

  return {
    users,
    pendingStudents,
    isLoading,
    fetchUsers,
    fetchPendingStudents,
    approveStudent,
    rejectStudent,
    addUser,
    updateUser,
    assignRfidToUser,
    toggleUserStatus,
    deleteUser,
    resetUserPassword,
  };
};
