import React, { createContext, useState, useEffect } from 'react';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '../model/user';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sod_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get<User>('/auth/me');
          setUser(res.data);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const register = async (data: RegisterRequest) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    const { access_token, user: registeredUser } = res.data;
    localStorage.setItem('sod_token', access_token);
    setToken(access_token);
    setUser(registeredUser);
  };

  const login = async (data: LoginRequest) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    const { access_token, user: loggedInUser } = res.data;
    localStorage.setItem('sod_token', access_token);
    setToken(access_token);
    setUser(loggedInUser);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

