import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Pencil,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

import { appointmentsApi } from '../api/appointments.api';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/auth-context';
import { EditAppointmentModal } from '../components/admin/EditAppointmentModal';
import { StatusBadge } from '../components/admin/StatusBadge';
import { BrandLogo } from '../components/layout/BrandLogo';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import type { Appointment, AppointmentStatus } from '../types/api';
import { appointmentDateParts, dateFilterToIso } from '../utils/dates';

interface FilterState {
  from: string;
  to: string;
  status: AppointmentStatus | '';
  search: string;
  page: number;
}

const initialFilters: FilterState = { from: '', to: '', status: '', search: '', page: 1 };

export function AdminDashboardPage() {
  const { admin, logout } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [editing, setEditing] = useState<Appointment>();
  const [notice, setNotice] = useState('');

  const apiFilters = useMemo(
    () => ({
      from: dateFilterToIso(filters.from),
      to: dateFilterToIso(filters.to, true),
      status: filters.status,
      search: filters.search.trim() || undefined,
      page: filters.page,
      limit: 20,
    }),
    [filters],
  );

  const appointments = useQuery({
    queryKey: ['admin-appointments', apiFilters],
    queryFn: () => appointmentsApi.list(apiFilters),
    placeholderData: keepPreviousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentsApi.setStatus(id, status),
    onSuccess: async (result) => {
      setNotice(result.message ?? 'Estado actualizado.');
      await queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: appointmentsApi.cancel,
    onSuccess: async (result) => {
      setNotice(result.message ?? 'Cita cancelada.');
      await queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
  });

  const submitFilters = (event: FormEvent) => {
    event.preventDefault();
    setFilters({ ...draft, page: 1 });
  };

  const clearFilters = () => {
    setDraft(initialFilters);
    setFilters(initialFilters);
  };

  const mutationError = statusMutation.error ?? cancelMutation.error;
  const page = appointments.data?.pagination;

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="brand brand--light">
          <BrandLogo className="brand-logo--sidebar" />
        </div>
        <nav aria-label="Administración">
          <span className="admin-nav-item admin-nav-item--active">
            <CalendarDays size={19} /> Citas
          </span>
        </nav>
        <button type="button" className="admin-nav-item admin-logout" onClick={logout}>
          <LogOut size={19} /> Cerrar sesión
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="eyebrow">Administración</span>
            <h1>Agenda de citas</h1>
            <p>Consulta, filtra y gestiona todas las reservas.</p>
          </div>
          <div className="admin-profile">
            <span>{admin?.name.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{admin?.name}</strong>
              <small>{admin?.email}</small>
            </div>
          </div>
        </header>

        {notice && (
          <Alert tone="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}
        {mutationError && <Alert tone="error">{errorMessage(mutationError)}</Alert>}

        <form className="filters" onSubmit={submitFilters}>
          <label className="field search-field">
            <span>Buscar</span>
            <span className="input-wrap">
              <Search size={17} />
              <input
                value={draft.search}
                onChange={(event) => setDraft({ ...draft, search: event.target.value })}
                placeholder="Nombre, teléfono o correo"
              />
            </span>
          </label>
          <label className="field">
            <span>Desde</span>
            <input
              type="date"
              value={draft.from}
              onChange={(event) => setDraft({ ...draft, from: event.target.value })}
            />
          </label>
          <label className="field">
            <span>Hasta</span>
            <input
              type="date"
              value={draft.to}
              min={draft.from || undefined}
              onChange={(event) => setDraft({ ...draft, to: event.target.value })}
            />
          </label>
          <label className="field">
            <span>Estado</span>
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as AppointmentStatus | '' })
              }
            >
              <option value="">Todos</option>
              <option value="BOOKED">Reservadas</option>
              <option value="COMPLETED">Completadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </label>
          <button className="button button--primary filter-submit" type="submit">
            Aplicar
          </button>
          <button
            className="button button--ghost filter-clear"
            type="button"
            onClick={clearFilters}
          >
            Limpiar
          </button>
        </form>

        <section className="appointments-card" aria-live="polite">
          <div className="appointments-card__heading">
            <div>
              <h2>Citas</h2>
              <span>{page ? `${page.total} registros` : '—'}</span>
            </div>
            {appointments.isFetching && <Spinner label="Actualizando" />}
          </div>

          {appointments.isLoading && (
            <div className="table-state">
              <Spinner label="Cargando citas" />
            </div>
          )}
          {appointments.isError && (
            <div className="table-state">
              <Alert tone="error">{errorMessage(appointments.error)}</Alert>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void appointments.refetch()}
              >
                Reintentar
              </button>
            </div>
          )}
          {!appointments.isLoading && appointments.data?.items.length === 0 && (
            <div className="empty-state">
              <CalendarDays size={32} />
              <h3>No hay citas</h3>
              <p>Prueba con otros filtros o espera una nueva reserva.</p>
            </div>
          )}

          {appointments.data && appointments.data.items.length > 0 && (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Estado</th>
                    <th>
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.data.items.map((appointment) => {
                    const date = appointmentDateParts(appointment.startsAt);
                    const pending = statusMutation.isPending || cancelMutation.isPending;
                    return (
                      <tr key={appointment.id}>
                        <td>
                          <strong>{date.date}</strong>
                          <small>{date.time}</small>
                        </td>
                        <td>
                          <strong>{appointment.customerName}</strong>
                          <small>ID {appointment.id.slice(0, 8)}</small>
                        </td>
                        <td>
                          <a href={`tel:${appointment.phone}`}>{appointment.phone}</a>
                          <small>{appointment.email ?? 'Sin correo'}</small>
                        </td>
                        <td>
                          <StatusBadge status={appointment.status} />
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="icon-button icon-button--bordered"
                              onClick={() => setEditing(appointment)}
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            {appointment.status === 'BOOKED' && (
                              <>
                                <button
                                  type="button"
                                  disabled={pending}
                                  className="icon-button icon-button--success"
                                  onClick={() =>
                                    statusMutation.mutate({
                                      id: appointment.id,
                                      status: 'COMPLETED',
                                    })
                                  }
                                  title="Marcar completada"
                                >
                                  <Check size={17} />
                                </button>
                                <button
                                  type="button"
                                  disabled={pending}
                                  className="icon-button icon-button--danger"
                                  onClick={() => {
                                    if (window.confirm('¿Cancelar esta cita?'))
                                      cancelMutation.mutate(appointment.id);
                                  }}
                                  title="Cancelar"
                                >
                                  <X size={17} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {page && page.pages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="button button--ghost"
                disabled={page.page <= 1}
                onClick={() => setFilters({ ...filters, page: page.page - 1 })}
              >
                <ChevronLeft size={17} /> Anterior
              </button>
              <span>
                Página {page.page} de {page.pages}
              </span>
              <button
                type="button"
                className="button button--ghost"
                disabled={page.page >= page.pages}
                onClick={() => setFilters({ ...filters, page: page.page + 1 })}
              >
                Siguiente <ChevronRight size={17} />
              </button>
            </div>
          )}
        </section>
      </main>

      {editing && (
        <EditAppointmentModal
          appointment={editing}
          onClose={() => setEditing(undefined)}
          onSaved={setNotice}
        />
      )}
    </div>
  );
}
