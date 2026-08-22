import { useQuery } from '@tanstack/react-query';
import { Clock3, MapPin, Scissors, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { appointmentsApi } from '../api/appointments.api';
import { errorMessage } from '../api/client';
import { BookingForm } from '../components/booking/BookingForm';
import { WeekCalendar } from '../components/booking/WeekCalendar';
import { BrandLogo } from '../components/layout/BrandLogo';
import { PublicHeader } from '../components/layout/PublicHeader';
import { Alert } from '../components/ui/Alert';
import { clientEnv } from '../config/env';
import type { AvailabilitySlot } from '../types/api';
import { currentWeekStart } from '../utils/dates';

export function PublicBookingPage() {
  const [weekStart, setWeekStart] = useState(currentWeekStart);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot>();
  const [success, setSuccess] = useState('');
  const availability = useQuery({
    queryKey: ['availability', weekStart],
    queryFn: () => appointmentsApi.availability(weekStart),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const changeWeek = (value: string) => {
    setWeekStart(value);
    setSelectedSlot(undefined);
    setSuccess('');
  };

  return (
    <div className="public-page">
      <PublicHeader />
      <main>
        <section className="hero">
          <div className="hero__content">
            <span className="eyebrow">Reserva en línea</span>
            <h1>
              Tu próximo corte,
              <br />
              <em>sin esperas.</em>
            </h1>
            <p>Escoge un horario disponible y confirma tu cita en menos de un minuto.</p>
            <div className="hero__barber">
              <Scissors size={16} aria-hidden="true" />
              <span>Barbero profesional</span>
              <strong>Felipe Oporta Martínez</strong>
            </div>
            <div className="hero__facts">
              <span>
                <Clock3 size={17} /> 10:00 a. m. — 9:00 p. m.
              </span>
              <span>
                <MapPin size={17} /> Horario local
              </span>
              <span>
                <ShieldCheck size={17} /> Reserva confirmada
              </span>
            </div>
          </div>
          <div className="hero__brand">
            <BrandLogo className="brand-logo--hero" />
          </div>
        </section>

        <div className="booking-container">
          {success && (
            <Alert tone="success" onClose={() => setSuccess('')}>
              {success} Te esperamos en {clientEnv.businessName}.
            </Alert>
          )}

          <WeekCalendar
            weekStart={weekStart}
            availability={availability.data}
            selected={selectedSlot}
            isLoading={availability.isLoading}
            isFetching={availability.isFetching}
            error={availability.isError ? errorMessage(availability.error) : undefined}
            onWeekChange={changeWeek}
            onSelect={(slot) => {
              setSelectedSlot(slot);
              setSuccess('');
              window.setTimeout(
                () =>
                  document.querySelector('.booking-panel')?.scrollIntoView({ behavior: 'smooth' }),
                50,
              );
            }}
            onRetry={() => void availability.refetch()}
          />

          {selectedSlot && (
            <BookingForm
              slot={selectedSlot}
              weekStart={weekStart}
              onBooked={(message) => {
                setSuccess(message);
                setSelectedSlot(undefined);
                window.scrollTo({ top: 420, behavior: 'smooth' });
              }}
              onCancel={() => setSelectedSlot(undefined)}
            />
          )}
        </div>
      </main>
      <footer className="public-footer">
        <BrandLogo className="brand-logo--footer" />
        <span>Agenda en línea · Costa Rica</span>
      </footer>
    </div>
  );
}
