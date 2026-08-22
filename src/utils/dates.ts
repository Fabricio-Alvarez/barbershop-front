import { addDays, format, startOfWeek } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';

import { clientEnv } from '../config/env';

function dateFromYmd(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!, 12));
}

export function ymd(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function businessToday(): string {
  return formatInTimeZone(new Date(), clientEnv.businessTimezone, 'yyyy-MM-dd');
}

export function currentWeekStart(): string {
  return ymd(startOfWeek(dateFromYmd(businessToday()), { weekStartsOn: 1 }));
}

export function shiftWeek(value: string, amount: number): string {
  return ymd(addDays(dateFromYmd(value), amount * 7));
}

export function shiftDay(value: string, amount: number): string {
  return ymd(addDays(dateFromYmd(value), amount));
}

export function dayLabel(value: string): { weekday: string; day: string } {
  const date = dateFromYmd(value);
  return {
    weekday: format(date, 'EEE', { locale: es }).replace('.', ''),
    day: format(date, 'd MMM', { locale: es }),
  };
}

export function weekRangeLabel(weekStart: string): string {
  const start = dateFromYmd(weekStart);
  const end = addDays(start, 6);
  return `${format(start, "d 'de' MMM", { locale: es })} — ${format(end, "d 'de' MMM", {
    locale: es,
  })}`;
}

export function formatAppointmentDate(value: string): string {
  return formatInTimeZone(new Date(value), clientEnv.businessTimezone, "EEEE d 'de' MMMM, h:mm a", {
    locale: es,
  });
}

export function appointmentDateParts(value: string): { date: string; time: string } {
  return {
    date: formatInTimeZone(new Date(value), clientEnv.businessTimezone, 'dd MMM yyyy', {
      locale: es,
    }),
    time: formatInTimeZone(new Date(value), clientEnv.businessTimezone, 'h:mm a', {
      locale: es,
    }),
  };
}

export function toDateTimeLocal(value: string): string {
  return formatInTimeZone(new Date(value), clientEnv.businessTimezone, "yyyy-MM-dd'T'HH:mm");
}

export function fromDateTimeLocal(value: string): string {
  return fromZonedTime(value, clientEnv.businessTimezone).toISOString();
}

export function dateFilterToIso(value: string, endExclusive = false): string | undefined {
  if (!value) return undefined;
  const date = endExclusive ? shiftDay(value, 1) : value;
  return fromZonedTime(`${date}T00:00:00`, clientEnv.businessTimezone).toISOString();
}
