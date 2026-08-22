export type AppointmentStatus = 'BOOKED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  startsAt: string;
  endsAt: string;
  localDate: string;
  localTime: string;
  available: boolean;
}

export interface Availability {
  timezone: string;
  weekStart: string;
  slots: AvailabilitySlot[];
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AppointmentPage {
  items: Appointment[];
  pagination: Pagination;
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}
