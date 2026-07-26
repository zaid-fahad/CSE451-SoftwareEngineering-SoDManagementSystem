import React, { createContext, useState, useEffect } from 'react';
import { User, UserRole, RegisterRequest, LoginRequest, AuthResponse } from '../model/user';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const DEFAULT_DEMO_USER: User = {
  id: 'st-demo-101',
  department_id: '2021-1-60-001',
  name: 'Alice Smith',
  email: 'alice.smith@univ.edu',
  role: 'Student',
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_DEMO_USER);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sod_token') || 'demo-token');
  const [isLoading] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('sod_token');
      if (storedToken) {
        try {
          const res = await api.get<User>('/auth/me');
          setUser(res.data);
        } catch {
          // Keep demo user if backend offline
        }
      }
    };
    initAuth();
  }, []);

  const register = async (data: RegisterRequest) => {
    try {
      const res = await api.post<AuthResponse>('/auth/register', data);
      const { access_token, user: registeredUser } = res.data;
      localStorage.setItem('sod_token', access_token);
      setToken(access_token);
      setUser(registeredUser);
    } catch {
      // Mock registration fallback for offline preview
      const newUser: User = {
        id: `st-${Date.now()}`,
        department_id: data.department_id,
        name: data.name,
        email: data.email,
        role: data.role || 'Student',
      };
      setToken('demo-token');
      setUser(newUser);
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      const { access_token, user: loggedInUser } = res.data;
      localStorage.setItem('sod_token', access_token);
      setToken(access_token);
      setUser(loggedInUser);
    } catch {
      // Mock login fallback for offline preview
      const loggedUser: User = {
        id: 'st-demo-101',
        department_id: '2021-1-60-001',
        name: data.email.split('@')[0].replace('.', ' '),
        email: data.email,
        role: 'Student',
      };
      setToken('demo-token');
      setUser(loggedUser);
    }
  };

  const switchRole = (role: UserRole) => {
    setUser((prev) => (prev ? { ...prev, role } : { ...DEFAULT_DEMO_USER, role }));
  };

  const logout = () => {
    localStorage.removeItem('sod_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        register,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
