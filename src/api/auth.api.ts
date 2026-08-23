import { apiFetch, refreshAccessToken, setAccessToken } from './client';
import type { Admin, ApiEnvelope } from '../types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  admin: Admin;
}

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await apiFetch<ApiEnvelope<LoginResponse>>('/auth/login', {
      method: 'POST',
      headers: { 'X-CSRF-Token': '1' },
      body: JSON.stringify(payload),
    });
    setAccessToken(response.data.accessToken);
    return response.data;
  },

  async refresh() {
    return refreshAccessToken();
  },

  async logout() {
    await apiFetch('/auth/logout', {
      method: 'POST',
      headers: { 'X-CSRF-Token': '1' },
    });
    setAccessToken(null);
  },

  async me() {
    const response = await apiFetch<ApiEnvelope<Admin>>('/auth/me');
    return response.data;
  },
};
