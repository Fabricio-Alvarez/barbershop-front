import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Mail, Phone, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { appointmentsApi } from '../../api/appointments.api';
import { errorMessage } from '../../api/client';
import type { AvailabilitySlot } from '../../types/api';
import { formatAppointmentDate } from '../../utils/dates';
import { bookingFormSchema, type BookingFormValues } from '../../validations/forms';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';

interface BookingFormProps {
  slot: AvailabilitySlot;
  weekStart: string;
  onBooked: (message: string) => void;
  onCancel: () => void;
}

export function BookingForm({ slot, weekStart, onBooked, onCancel }: BookingFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { customerName: '', phone: '', email: '', confirmed: false },
  });

  const booking = useMutation({
    mutationFn: (values: BookingFormValues) =>
      appointmentsApi.create({
        customerName: values.customerName,
        phone: values.phone,
        ...(values.email && { email: values.email }),
        startsAt: slot.startsAt,
        confirmed: true,
      }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['availability', weekStart] });
      onBooked(result.message ?? 'Tu cita quedó confirmada.');
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ['availability', weekStart] });
    },
  });

  return (
    <section className="booking-panel" aria-labelledby="booking-title">
      <div className="booking-panel__summary">
        <span className="summary-icon">
          <CalendarCheck size={22} />
        </span>
        <div>
          <span className="eyebrow">Horario seleccionado</span>
          <h2 id="booking-title">{formatAppointmentDate(slot.startsAt)}</h2>
        </div>
      </div>

      {booking.isError && <Alert tone="error">{errorMessage(booking.error)}</Alert>}

      <form className="form-grid" onSubmit={handleSubmit((values) => booking.mutate(values))}>
        <label className="field field--full">
          <span>Nombre completo</span>
          <span className="input-wrap">
            <UserRound size={18} />
            <input autoComplete="name" placeholder="Tu nombre" {...register('customerName')} />
          </span>
          {errors.customerName && (
            <small className="field-error">{errors.customerName.message}</small>
          )}
        </label>

        <label className="field">
          <span>Teléfono</span>
          <span className="input-wrap">
            <Phone size={18} />
            <input
              autoComplete="tel"
              inputMode="tel"
              placeholder="+506 8888 8888"
              {...register('phone')}
            />
          </span>
          {errors.phone && <small className="field-error">{errors.phone.message}</small>}
        </label>

        <label className="field">
          <span>
            Correo <em>opcional</em>
          </span>
          <span className="input-wrap">
            <Mail size={18} />
            <input
              autoComplete="email"
              type="email"
              placeholder="tu@correo.com"
              {...register('email')}
            />
          </span>
          {errors.email && <small className="field-error">{errors.email.message}</small>}
        </label>

        <label className="check-field field--full">
          <input type="checkbox" {...register('confirmed')} />
          <span>Confirmo que la fecha y mis datos son correctos.</span>
        </label>
        {errors.confirmed && (
          <small className="field-error field--full">{errors.confirmed.message}</small>
        )}

        <div className="form-actions field--full">
          <button
            type="button"
            className="button button--ghost"
            onClick={onCancel}
            disabled={booking.isPending}
          >
            Elegir otro horario
          </button>
          <button type="submit" className="button button--primary" disabled={booking.isPending}>
            {booking.isPending ? <Spinner label="Confirmando" /> : 'Confirmar cita'}
          </button>
        </div>
      </form>
    </section>
  );
}
