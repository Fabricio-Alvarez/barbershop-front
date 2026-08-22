import { describe, expect, it } from 'vitest';

import { dayLabel, shiftWeek, ymd } from './dates';

describe('calendar date helpers', () => {
  it('navigates by complete weeks', () => {
    expect(shiftWeek('2026-08-17', 1)).toBe('2026-08-24');
    expect(shiftWeek('2026-08-17', -1)).toBe('2026-08-10');
  });

  it('keeps a stable date-only representation', () => {
    expect(ymd(new Date(Date.UTC(2026, 7, 17, 12)))).toBe('2026-08-17');
    expect(dayLabel('2026-08-17').weekday).toBe('lun');
  });
});
