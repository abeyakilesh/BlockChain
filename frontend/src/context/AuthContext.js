'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('creatorchain_token');
    const userData = localStorage.getItem('creatorchain_user');
    if (token && userData) {
      try {
        api.setToken(token);
        setUser(JSON.parse(userData));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email) => {
    const data = await api.login(email);
    setUser(data.user);
    localStorage.setItem('creatorchain_user', JSON.stringify(data.user));
    return data;
  }, []);

  const register = useCallback(async (email, name, role) => {
    const data = await api.register(email, name, role);
    setUser(data.user);
    localStorage.setItem('creatorchain_user', JSON.stringify(data.user));
    return data;
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    localStorage.removeItem('creatorchain_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
