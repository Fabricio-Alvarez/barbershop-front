import { createContext, useContext } from 'react';

import type { LoginPayload } from '../api/auth.api';
import type { Admin } from '../types/api';

export interface AuthContextValue {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
