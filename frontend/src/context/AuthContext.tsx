import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role?: 'student' | 'admin' | 'employee') => Promise<User>;
  signup: (name: string, email: string, password: string, role?: 'student' | 'admin' | 'employee') => Promise<User>;
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

  const signup = async (name: string, email: string, password: string, role: 'student' | 'admin' | 'employee' = 'student'): Promise<User> => {
    const { data } = await api.post('/auth/signup', { name, email, password, role });
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
    <AuthContext.Provider value={{ user, token, login, signup, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
