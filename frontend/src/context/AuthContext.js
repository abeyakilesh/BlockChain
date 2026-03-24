'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

// Demo users for when backend is unavailable
const DEMO_USERS = {
  'alex@creatorchain.io': { id: 'demo-creator-1', email: 'alex@creatorchain.io', name: 'Alex Chen', walletAddress: '0xDemoCreator...', role: 'creator' },
  'admin@creatorchain.io': { id: 'demo-admin-1', email: 'admin@creatorchain.io', name: 'Admin', walletAddress: '0xDemoAdmin...', role: 'admin' },
  'buyer@creatorchain.io': { id: 'demo-buyer-1', email: 'buyer@creatorchain.io', name: 'Sarah Kim', walletAddress: '0xDemoBuyer...', role: 'creator' },
};

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

  const persistUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem('creatorchain_user', JSON.stringify(userData));
    if (token) api.setToken(token);
  };

  const login = useCallback(async (email) => {
    try {
      const data = await api.login(email);
      persistUser(data.user, data.token);
      return data;
    } catch (err) {
      // Fallback: use demo user if backend is down
      const demo = DEMO_USERS[email.toLowerCase()];
      if (demo) {
        persistUser(demo, 'demo-token-' + demo.role);
        return { user: demo, token: 'demo-token-' + demo.role };
      }
      throw err;
    }
  }, []);

  const register = useCallback(async (email, name, role) => {
    try {
      const data = await api.register(email, name, role);
      persistUser(data.user, data.token);
      return data;
    } catch (err) {
      // Fallback: create a local demo user
      const demoUser = {
        id: 'demo-' + Date.now(),
        email,
        name,
        walletAddress: '0x' + Math.random().toString(16).slice(2, 14) + '...',
        role,
      };
      persistUser(demoUser, 'demo-token-' + role);
      return { user: demoUser, token: 'demo-token-' + role };
    }
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    localStorage.removeItem('creatorchain_user');
    localStorage.removeItem('creatorchain_token');
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
