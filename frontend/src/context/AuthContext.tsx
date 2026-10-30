import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'employee';
  age?: number;
  status?: string;
  phone?: string;
  gender?: string;
  institution?: string;
  grade_or_designation?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role?: 'student' | 'admin' | 'employee') => Promise<User>;
  sendOtp: (email: string, name?: string, purpose?: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string, role?: 'student' | 'admin' | 'employee', otp?: string, adminSecretKey?: string) => Promise<User>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (updatedData: Partial<User>) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);

  const login = async (email: string, password: string, role?: 'student' | 'admin' | 'employee'): Promise<User> => {
    const { data } = await api.post('/auth/login', { email, password, role });
    const { tokens, user: u } = data.data;
    const accessToken = tokens?.accessToken || data.data.accessToken;
    const refreshToken = tokens?.refreshToken || data.data.refreshToken;
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(accessToken);
    setUser(u);
    return u;
  };

  const sendOtp = async (email: string, name?: string, purpose = 'signup'): Promise<{ success: boolean; message: string; devOtp?: string }> => {
    const { data } = await api.post('/auth/send-otp', { email, name, purpose });
    return data;
  };

  const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data;
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'student' | 'admin' | 'employee' = 'student',
    otp?: string,
    adminSecretKey?: string
  ): Promise<User> => {
    const { data } = await api.post('/auth/signup', { name, email, password, role, otp, adminSecretKey });
    const { tokens, user: u } = data.data;
    const accessToken = tokens?.accessToken || data.data.accessToken;
    const refreshToken = tokens?.refreshToken || data.data.refreshToken;
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(accessToken);
    setUser(u);
    return u;
  };

  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
    return data;
  };


  const updateUser = (updatedData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, sendOtp, verifyOtp, signup, resetPassword, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
