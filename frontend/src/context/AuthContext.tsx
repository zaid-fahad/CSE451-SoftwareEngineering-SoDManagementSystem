import React, { createContext, useState, useEffect } from 'react';
import { User, UserRole, RegisterRequest, LoginRequest } from '../model/user';
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sod_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('sod_token');
      if (storedToken) {
        try {
          const res = await api.get<User>('/auth/me');
          setUser(res.data);
          setToken(storedToken);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('sod_token');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const register = async (data: RegisterRequest) => {
    try {
      const regRes = await api.post<User>('/auth/register', data);
      
      // Auto login after successful registration
      const loginRes = await api.post<{ access_token: string; token_type: string }>('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { access_token } = loginRes.data;
      localStorage.setItem('sod_token', access_token);
      setToken(access_token);
      setUser(regRes.data);
    } catch (err: any) {
      throw err;
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const res = await api.post<{ access_token: string; token_type: string }>('/auth/login', data);
      const { access_token } = res.data;
      localStorage.setItem('sod_token', access_token);
      setToken(access_token);

      // Fetch user profile info
      const userRes = await api.get<User>('/auth/me');
      setUser(userRes.data);
    } catch (err: any) {
      throw err;
    }
  };

  const switchRole = (role: UserRole) => {
    setUser((prev) => (prev ? { ...prev, role } : null));
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
