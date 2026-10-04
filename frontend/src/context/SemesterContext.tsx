import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Semester, SemesterStats, CreateSemesterPayload } from '../model/semester';
import { api } from '../services/api';

interface SemesterContextType {
  semesters: Semester[];
  activeSemester: Semester | null;
  isLoading: boolean;
  refreshSemesters: () => Promise<void>;
  toggleOnboarding: (id: number, currentOpen: boolean) => Promise<void>;
  createSemester: (payload: CreateSemesterPayload) => Promise<Semester>;
  setActiveSemester: (id: number) => Promise<void>;
  archiveSemester: (id: number) => Promise<Semester>;
  getSemesterStats: (id: number) => Promise<SemesterStats>;
}

export const SemesterContext = createContext<SemesterContextType | undefined>(undefined);

export const SemesterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemester, setActiveSemesterState] = useState<Semester | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSemesters = useCallback(async () => {
    try {
      const res = await api.get<Semester[]>('/semesters');
      if (res.data) {
        setSemesters(res.data);
        const active = res.data.find((s) => s.is_active && !s.is_archived) || null;
        setActiveSemesterState(active);
      }
    } catch (err) {
      console.warn('Failed to load semesters from server, using default.', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSemesters();
  }, [refreshSemesters]);

  const toggleOnboarding = async (id: number, currentOpen: boolean) => {
    try {
      const res = await api.patch<Semester>(`/semesters/${id}`, { is_onboarding_open: !currentOpen });
      setSemesters((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_onboarding_open: res.data.is_onboarding_open } : s))
      );
      if (activeSemester && activeSemester.id === id) {
        setActiveSemesterState((prev) => (prev ? { ...prev, is_onboarding_open: res.data.is_onboarding_open } : null));
      }
    } catch (err) {
      console.error('Failed to toggle onboarding for semester:', err);
      throw err;
    }
  };

  const setActiveSemester = async (id: number) => {
    try {
      const res = await api.patch<Semester>(`/semesters/${id}`, { is_active: true });
      setSemesters((prev) =>
        prev.map((s) => ({
          ...s,
          is_active: s.id === id,
        }))
      );
      setActiveSemesterState(res.data);
    } catch (err) {
      console.error('Failed to activate semester:', err);
      throw err;
    }
  };

  const archiveSemester = async (id: number): Promise<Semester> => {
    try {
      const res = await api.post<Semester>(`/semesters/${id}/archive`);
      setSemesters((prev) =>
        prev.map((s) => (s.id === id ? res.data : s))
      );
      if (activeSemester?.id === id) {
        setActiveSemesterState(null);
      }
      return res.data;
    } catch (err) {
      console.error('Failed to archive semester:', err);
      throw err;
    }
  };

  const createSemester = async (payload: CreateSemesterPayload): Promise<Semester> => {
    try {
      const res = await api.post<Semester>('/semesters', payload);
      await refreshSemesters();
      return res.data;
    } catch (err) {
      console.error('Failed to create semester:', err);
      throw err;
    }
  };

  const getSemesterStats = async (id: number): Promise<SemesterStats> => {
    const res = await api.get<SemesterStats>(`/semesters/${id}/stats`);
    return res.data;
  };

  return (
    <SemesterContext.Provider
      value={{
        semesters,
        activeSemester,
        isLoading,
        refreshSemesters,
        toggleOnboarding,
        createSemester,
        setActiveSemester,
        archiveSemester,
        getSemesterStats,
      }}
    >
      {children}
    </SemesterContext.Provider>
  );
};

export const useSemesters = (): SemesterContextType => {
  const context = useContext(SemesterContext);
  if (!context) {
    throw new Error('useSemesters must be used within a SemesterProvider');
  }
  return context;
};
