import type { AppointmentStatus } from '../../types/api';

const labels: Record<AppointmentStatus, string> = {
  BOOKED: 'Reservada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={`status status--${status.toLowerCase()}`}>{labels[status]}</span>;
}
