import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

import type { Availability, AvailabilitySlot } from '../../types/api';
import { currentWeekStart, dayLabel, shiftDay, weekRangeLabel } from '../../utils/dates';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';

interface WeekCalendarProps {
  weekStart: string;
  availability?: Availability;
  selected?: AvailabilitySlot;
  isLoading: boolean;
  isFetching: boolean;
  error?: string;
  onWeekChange: (weekStart: string) => void;
  onSelect: (slot: AvailabilitySlot) => void;
  onRetry: () => void;
}

export function WeekCalendar({
  weekStart,
  availability,
  selected,
  isLoading,
  isFetching,
  error,
  onWeekChange,
  onSelect,
  onRetry,
}: WeekCalendarProps) {
  const currentWeek = currentWeekStart();
  const days = Array.from({ length: 7 }, (_, index) => shiftDay(weekStart, index));

  return (
    <section className="calendar-card" aria-labelledby="availability-title">
      <div className="section-heading calendar-heading">
        <div>
          <span className="eyebrow">Agenda semanal</span>
          <h2 id="availability-title">Elige tu horario</h2>
          <p>Todos los espacios duran una hora.</p>
        </div>
        <div className="week-nav" aria-label="Navegación semanal">
          <button
            type="button"
            className="icon-button icon-button--bordered"
            disabled={weekStart <= currentWeek}
            onClick={() => onWeekChange(shiftDay(weekStart, -7))}
            aria-label="Semana anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <span>{weekRangeLabel(weekStart)}</span>
          <button
            type="button"
            className="icon-button icon-button--bordered"
            onClick={() => onWeekChange(shiftDay(weekStart, 7))}
            aria-label="Semana siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="calendar-state">
          <Alert tone="error">{error}</Alert>
          <button type="button" className="button button--secondary" onClick={onRetry}>
            <RefreshCw size={17} /> Reintentar
          </button>
        </div>
      )}

      {isLoading && (
        <div className="calendar-state">
          <Spinner label="Consultando disponibilidad" />
        </div>
      )}

      {!isLoading && !error && availability && (
        <>
          <div className="calendar-scroll">
            <div className="week-grid">
              {days.map((date) => {
                const label = dayLabel(date);
                const slots = availability.slots.filter((slot) => slot.localDate === date);
                return (
                  <div className="day-column" key={date}>
                    <div className="day-column__header">
                      <span>{label.weekday}</span>
                      <strong>{label.day}</strong>
                    </div>
                    <div className="day-column__slots">
                      {slots.length === 0 && (
                        <div className="closed-day">
                          <strong>Cerrado</strong>
                          <span>Domingos</span>
                        </div>
                      )}
                      {slots.map((slot) => {
                        const isSelected = selected?.startsAt === slot.startsAt;
                        return (
                          <button
                            type="button"
                            className={`slot ${isSelected ? 'slot--selected' : ''}`}
                            key={slot.startsAt}
                            disabled={!slot.available}
                            aria-pressed={isSelected}
                            onClick={() => onSelect(slot)}
                          >
                            {slot.localTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="calendar-legend">
            <span>
              <i className="legend-dot legend-dot--available" />
              Disponible
            </span>
            <span>
              <i className="legend-dot" />
              No disponible
            </span>
            {isFetching && <Spinner label="Actualizando" />}
          </div>
        </>
      )}
    </section>
  );
}
