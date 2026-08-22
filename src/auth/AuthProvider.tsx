import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { authApi, type LoginPayload } from '../api/auth.api';
import type { Admin } from '../types/api';
import { AuthContext } from './auth-context';

function storedAdmin(): Admin | null {
  const value = sessionStorage.getItem('barbershop_admin');
  if (!value) return null;
  try {
    return JSON.parse(value) as Admin;
  } catch {
    sessionStorage.removeItem('barbershop_admin');
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => storedAdmin());

  const logout = useCallback(() => {
    sessionStorage.removeItem('barbershop_token');
    sessionStorage.removeItem('barbershop_admin');
    setAdmin(null);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await authApi.login(payload);
    sessionStorage.setItem('barbershop_token', result.token);
    sessionStorage.setItem('barbershop_admin', JSON.stringify(result.admin));
    setAdmin(result.admin);
  }, []);

  useEffect(() => {
    const handleExpired = () => setAdmin(null);
    window.addEventListener('barbershop:session-expired', handleExpired);
    return () => window.removeEventListener('barbershop:session-expired', handleExpired);
  }, []);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin && sessionStorage.getItem('barbershop_token')),
      login,
      logout,
    }),
    [admin, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
