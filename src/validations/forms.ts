import { z } from 'zod';

const name = z.string().trim().min(2, 'Ingresa tu nombre.').max(100, 'Máximo 100 caracteres.');
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,25}$/, 'Ingresa un teléfono válido.');
const email = z
  .union([z.literal(''), z.string().trim().email('Ingresa un correo válido.').max(255)])
  .optional();

export const bookingFormSchema = z.object({
  customerName: name,
  phone,
  email,
  confirmed: z.boolean().refine(Boolean, 'Confirma que los datos son correctos.'),
});

export const loginFormSchema = z.object({
  email: z.string().trim().email('Ingresa un correo válido.'),
  password: z.string().min(8, 'Ingresa tu contraseña.').max(128),
});

export const editAppointmentSchema = z.object({
  customerName: name,
  phone,
  email,
  startsAt: z.string().min(1, 'Selecciona fecha y hora.'),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type EditAppointmentValues = z.infer<typeof editAppointmentSchema>;
