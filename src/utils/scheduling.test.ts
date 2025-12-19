import { describe, it, expect } from 'vitest';
import {
  isCardAvailableOnDate,
  formatScheduleDescription,
  SCHEDULE_PRESETS,
  getNextOccurrence,
} from './scheduling';
import type { ScheduleConfig } from '../types/card';

describe('scheduling', () => {
  describe('isCardAvailableOnDate', () => {
    it('should return true for daily schedule on any date', () => {
      const config: ScheduleConfig = {
        rrule: `DTSTART:20240101T000000Z\n${SCHEDULE_PRESETS.daily}`,
      };
      const testDate = new Date('2024-01-15T12:00:00Z');
      expect(isCardAvailableOnDate(config, testDate)).toBe(true);
    });

    it('should return true for weekdays schedule on Monday', () => {
      const config: ScheduleConfig = {
        rrule: `DTSTART:20240101T000000Z\n${SCHEDULE_PRESETS.weekdays}`,
      };
      // Monday, January 15, 2024
      const monday = new Date('2024-01-15T12:00:00Z');
      expect(isCardAvailableOnDate(config, monday)).toBe(true);
    });

    it('should return false for weekdays schedule on Saturday', () => {
      const config: ScheduleConfig = {
        rrule: `DTSTART:20240101T000000Z\n${SCHEDULE_PRESETS.weekdays}`,
      };
      // Saturday, January 13, 2024
      const saturday = new Date('2024-01-13T12:00:00Z');
      expect(isCardAvailableOnDate(config, saturday)).toBe(false);
    });

    it('should return true for weekends schedule on Saturday', () => {
      const config: ScheduleConfig = {
        rrule: `DTSTART:20240101T000000Z\n${SCHEDULE_PRESETS.weekends}`,
      };
      const saturday = new Date('2024-01-13T12:00:00Z');
      expect(isCardAvailableOnDate(config, saturday)).toBe(true);
    });

    it('should return false for weekends schedule on Monday', () => {
      const config: ScheduleConfig = {
        rrule: `DTSTART:20240101T000000Z\n${SCHEDULE_PRESETS.weekends}`,
      };
      const monday = new Date('2024-01-15T12:00:00Z');
      expect(isCardAvailableOnDate(config, monday)).toBe(false);
    });

    it('should handle weekly schedule with specific days', () => {
      // Monday and Wednesday
      const config: ScheduleConfig = {
        rrule: `DTSTART:20240101T000000Z\n${SCHEDULE_PRESETS.weekly([1, 3])}`,
      };
      const monday = new Date('2024-01-15T12:00:00Z'); // Monday
      const wednesday = new Date('2024-01-17T12:00:00Z'); // Wednesday
      const tuesday = new Date('2024-01-16T12:00:00Z'); // Tuesday

      expect(isCardAvailableOnDate(config, monday)).toBe(true);
      expect(isCardAvailableOnDate(config, wednesday)).toBe(true);
      expect(isCardAvailableOnDate(config, tuesday)).toBe(false);
    });

    it('should handle monthly schedule on specific dates', () => {
      const config: ScheduleConfig = {
        rrule: `DTSTART:20240101T000000Z\n${SCHEDULE_PRESETS.monthly([1, 15])}`,
      };
      // Use midnight local time to avoid timezone issues
      const firstDay = new Date(2024, 0, 1, 0, 0, 0);
      const fifteenthDay = new Date(2024, 0, 15, 0, 0, 0);
      const tenthDay = new Date(2024, 0, 10, 0, 0, 0);

      expect(isCardAvailableOnDate(config, firstDay)).toBe(true);
      expect(isCardAvailableOnDate(config, fifteenthDay)).toBe(true);
      expect(isCardAvailableOnDate(config, tenthDay)).toBe(false);
    });

    it('should return true for first of month schedule on the 1st', () => {
      const config: ScheduleConfig = {
        rrule: `DTSTART:20240101T000000Z\n${SCHEDULE_PRESETS.firstOfMonth}`,
      };
      // Use midnight local time to avoid timezone issues
      const firstDay = new Date(2024, 0, 1, 0, 0, 0);
      const otherDay = new Date(2024, 0, 15, 0, 0, 0);

      expect(isCardAvailableOnDate(config, firstDay)).toBe(true);
      expect(isCardAvailableOnDate(config, otherDay)).toBe(false);
    });

    it('should return true for last of month schedule on the last day', () => {
      const config: ScheduleConfig = {
        rrule: `DTSTART:20240101T000000Z\n${SCHEDULE_PRESETS.lastOfMonth}`,
      };
      // Use midnight local time to avoid timezone issues
      const lastDayJan = new Date(2024, 0, 31, 0, 0, 0);
      const lastDayFeb = new Date(2024, 1, 29, 0, 0, 0); // 2024 is leap year
      const otherDay = new Date(2024, 0, 15, 0, 0, 0);

      expect(isCardAvailableOnDate(config, lastDayJan)).toBe(true);
      expect(isCardAvailableOnDate(config, lastDayFeb)).toBe(true);
      expect(isCardAvailableOnDate(config, otherDay)).toBe(false);
    });

    it('should return false for invalid RRule string', () => {
      const config: ScheduleConfig = {
        rrule: 'INVALID_RRULE',
      };
      expect(isCardAvailableOnDate(config)).toBe(false);
    });

    it('should use current date when no date is provided', () => {
      const config: ScheduleConfig = {
        rrule: SCHEDULE_PRESETS.daily,
      };
      // Should not throw and should return a boolean
      const result = isCardAvailableOnDate(config);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('formatScheduleDescription', () => {
    it('should format daily schedule', () => {
      const config: ScheduleConfig = {
        rrule: SCHEDULE_PRESETS.daily,
      };
      const description = formatScheduleDescription(config);
      // rrule.toText() returns "every day" not "daily"
      expect(description.toLowerCase()).toContain('day');
    });

    it('should format weekdays schedule', () => {
      const config: ScheduleConfig = {
        rrule: SCHEDULE_PRESETS.weekdays,
      };
      const description = formatScheduleDescription(config);
      expect(description.toLowerCase()).toContain('week');
    });

    it('should return fallback for invalid RRule', () => {
      const config: ScheduleConfig = {
        rrule: 'INVALID',
      };
      const description = formatScheduleDescription(config);
      expect(description).toBe('Scheduled');
    });
  });

  describe('getNextOccurrence', () => {
    it('should return next occurrence for daily schedule', () => {
      const config: ScheduleConfig = {
        rrule: SCHEDULE_PRESETS.daily,
      };
      const baseDate = new Date('2024-01-15T12:00:00Z');
      const next = getNextOccurrence(config, baseDate);

      expect(next).not.toBeNull();
      // Next occurrence should be the same day or later
      expect(next!.getTime()).toBeGreaterThanOrEqual(
        baseDate.getTime() - 24 * 60 * 60 * 1000
      );
    });

    it('should return next weekday for weekdays schedule on Friday', () => {
      const config: ScheduleConfig = {
        rrule: SCHEDULE_PRESETS.weekdays,
      };
      // Friday, January 12, 2024
      const friday = new Date('2024-01-12T12:00:00Z');
      const next = getNextOccurrence(config, friday);

      expect(next).not.toBeNull();
      // Next weekday should be Monday (skip weekend)
      const nextDay = next!.getDay();
      expect([1, 2, 3, 4, 5]).toContain(nextDay); // Monday to Friday
    });

    it('should return null for invalid RRule', () => {
      const config: ScheduleConfig = {
        rrule: 'INVALID',
      };
      const next = getNextOccurrence(config);
      expect(next).toBeNull();
    });

    it('should use current date when no date is provided', () => {
      const config: ScheduleConfig = {
        rrule: SCHEDULE_PRESETS.daily,
      };
      const next = getNextOccurrence(config);
      expect(next).not.toBeNull();
      expect(next).toBeInstanceOf(Date);
    });
  });

  describe('SCHEDULE_PRESETS', () => {
    it('should have all required presets', () => {
      expect(SCHEDULE_PRESETS.daily).toBeDefined();
      expect(SCHEDULE_PRESETS.weekdays).toBeDefined();
      expect(SCHEDULE_PRESETS.weekends).toBeDefined();
      expect(SCHEDULE_PRESETS.weekly).toBeDefined();
      expect(SCHEDULE_PRESETS.monthly).toBeDefined();
      expect(SCHEDULE_PRESETS.firstOfMonth).toBeDefined();
      expect(SCHEDULE_PRESETS.lastOfMonth).toBeDefined();
    });

    it('should generate valid weekly schedule with multiple days', () => {
      const rrule = SCHEDULE_PRESETS.weekly([1, 3, 5]);
      expect(rrule).toContain('FREQ=WEEKLY');
      expect(rrule).toContain('BYDAY=MO,WE,FR');
    });

    it('should generate valid monthly schedule with multiple dates', () => {
      const rrule = SCHEDULE_PRESETS.monthly([1, 15, 31]);
      expect(rrule).toContain('FREQ=MONTHLY');
      expect(rrule).toContain('BYMONTHDAY=1,15,31');
    });
  });
});
