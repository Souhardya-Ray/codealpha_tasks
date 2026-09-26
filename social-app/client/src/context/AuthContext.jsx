import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api('/auth/me');
      setUser(user);
    } catch (_) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); } catch (_) { /* ignore */ }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
