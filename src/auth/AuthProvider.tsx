import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authApi, type LoginPayload } from '../api/auth.api';
import { setAccessToken } from '../api/client';
import type { Admin } from '../types/api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setAdmin(null);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authApi.login(payload);
    setAdmin(result.admin);
  }, []);

  useEffect(() => {
    let active = true;

    void authApi
      .refresh()
      .then((session) => {
        if (active) setAdmin(session.admin);
      })
      .catch(() => {
        setAccessToken(null);
        if (active) setAdmin(null);
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setAccessToken(null);
      setAdmin(null);
    };
    window.addEventListener('barbershop:session-expired', handleExpired);
    return () => window.removeEventListener('barbershop:session-expired', handleExpired);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      isInitializing,
      login,
      logout,
    }),
    [admin, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
