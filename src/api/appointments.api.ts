import { apiFetch } from './client';
import type {
  ApiEnvelope,
  Appointment,
  AppointmentPage,
  AppointmentStatus,
  Availability,
} from '../types/api';

export interface CreateAppointmentPayload {
  customerName: string;
  phone: string;
  email?: string;
  startsAt: string;
  confirmed: true;
}

export interface AppointmentFilters {
  from?: string;
  to?: string;
  status?: AppointmentStatus | '';
  search?: string;
  page: number;
  limit: number;
}

export type UpdateAppointmentPayload = Partial<
  Pick<Appointment, 'customerName' | 'phone' | 'startsAt'>
> & { email?: string | null };

export const appointmentsApi = {
  async availability(weekStart: string) {
    const response = await apiFetch<ApiEnvelope<Availability>>(
      `/availability?weekStart=${encodeURIComponent(weekStart)}`,
    );
    return response.data;
  },

  async create(payload: CreateAppointmentPayload) {
    return apiFetch<ApiEnvelope<Appointment>>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async list(filters: AppointmentFilters) {
    const params = new URLSearchParams({
      page: String(filters.page),
      limit: String(filters.limit),
    });
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    const response = await apiFetch<ApiEnvelope<AppointmentPage>>(
      `/admin/appointments?${params.toString()}`,
    );
    return response.data;
  },

  async update(id: string, payload: UpdateAppointmentPayload) {
    return apiFetch<ApiEnvelope<Appointment>>(`/admin/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async setStatus(id: string, status: AppointmentStatus) {
    return apiFetch<ApiEnvelope<Appointment>>(`/admin/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async cancel(id: string) {
    return apiFetch<ApiEnvelope<Appointment>>(`/admin/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};
