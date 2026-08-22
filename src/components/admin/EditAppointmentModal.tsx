import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { appointmentsApi, type UpdateAppointmentPayload } from '../../api/appointments.api';
import { errorMessage } from '../../api/client';
import type { Appointment } from '../../types/api';
import { fromDateTimeLocal, toDateTimeLocal } from '../../utils/dates';
import { editAppointmentSchema, type EditAppointmentValues } from '../../validations/forms';
import { Alert } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

interface EditAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function EditAppointmentModal({ appointment, onClose, onSaved }: EditAppointmentModalProps) {
  const queryClient = useQueryClient();
  const originalLocalStart = toDateTimeLocal(appointment.startsAt);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditAppointmentValues>({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      customerName: appointment.customerName,
      phone: appointment.phone,
      email: appointment.email ?? '',
      startsAt: originalLocalStart,
    },
  });

  const update = useMutation({
    mutationFn: (values: EditAppointmentValues) => {
      const payload: UpdateAppointmentPayload = {
        customerName: values.customerName,
        phone: values.phone,
        email: values.email || null,
      };
      if (values.startsAt !== originalLocalStart) {
        payload.startsAt = fromDateTimeLocal(values.startsAt);
      }
      return appointmentsApi.update(appointment.id, payload);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      onSaved(result.message ?? 'Cita actualizada.');
      onClose();
    },
  });

  return (
    <Modal title="Editar cita" onClose={onClose}>
      {update.isError && <Alert tone="error">{errorMessage(update.error)}</Alert>}
      <form className="form-stack" onSubmit={handleSubmit((values) => update.mutate(values))}>
        <label className="field">
          <span>Nombre</span>
          <input {...register('customerName')} />
          {errors.customerName && (
            <small className="field-error">{errors.customerName.message}</small>
          )}
        </label>
        <label className="field">
          <span>Teléfono</span>
          <input {...register('phone')} />
          {errors.phone && <small className="field-error">{errors.phone.message}</small>}
        </label>
        <label className="field">
          <span>Correo</span>
          <input type="email" {...register('email')} />
          {errors.email && <small className="field-error">{errors.email.message}</small>}
        </label>
        <label className="field">
          <span>Fecha y hora</span>
          <input type="datetime-local" step="3600" {...register('startsAt')} />
          {errors.startsAt && <small className="field-error">{errors.startsAt.message}</small>}
        </label>
        <div className="form-actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button button--primary" disabled={update.isPending}>
            {update.isPending ? <Spinner label="Guardando" /> : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
