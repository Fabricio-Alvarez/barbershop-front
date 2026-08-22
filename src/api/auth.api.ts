import { apiFetch } from './client';
import type { Admin, ApiEnvelope } from '../types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await apiFetch<ApiEnvelope<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async me() {
    const response = await apiFetch<ApiEnvelope<Admin>>('/auth/me');
    return response.data;
  },
};
