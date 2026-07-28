import { useState, useCallback } from 'react';
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
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        };
        setUsers((prev) => [newUser, ...prev]);
        return newUser;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((userId: string, payload: UpdateUserPayload) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...payload } : u))
    );
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

  return {
    users,
    isLoading,
    addUser,
    updateUser,
    assignRfidToUser,
    toggleUserStatus,
    deleteUser,
  };
};
