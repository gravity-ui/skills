import { describe, expect, it } from 'vitest';

import { buildTimeZoneOptions, formatTimeZoneOffset } from './options';
import { getInitials, validateAvatarFile, validateProfile } from './validation';

describe('validateProfile', () => {
  it('accepts valid name and email', () => {
    expect(validateProfile({ name: 'Анна', email: 'anna@example.com' })).toEqual({});
  });

  it('requires name and email', () => {
    const errors = validateProfile({ name: '   ', email: '' });
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
  });

  it('rejects malformed email', () => {
    expect(validateProfile({ name: 'A', email: 'not-an-email' }).email).toBeTruthy();
    expect(validateProfile({ name: 'A', email: 'a b@example.com' }).email).toBeTruthy();
  });

  it('rejects too long name', () => {
    expect(validateProfile({ name: 'x'.repeat(101), email: 'a@b.co' }).name).toBeTruthy();
  });
});

describe('validateAvatarFile', () => {
  const makeFile = (type: string, size: number) => {
    const file = new File([''], 'avatar', { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  it('accepts a small png', () => {
    expect(validateAvatarFile(makeFile('image/png', 1024))).toBeNull();
  });

  it('rejects unsupported type', () => {
    expect(validateAvatarFile(makeFile('image/gif', 1024))).toMatch(/JPG/);
  });

  it('rejects oversized file', () => {
    expect(validateAvatarFile(makeFile('image/jpeg', 3 * 1024 * 1024))).toMatch(/2 МБ/);
  });
});

describe('getInitials', () => {
  it('takes first letters of up to two words', () => {
    expect(getInitials('Анна Смирнова')).toBe('АС');
    expect(getInitials('анна петровна смирнова')).toBe('АП');
    expect(getInitials('  Anna ')).toBe('A');
    expect(getInitials('')).toBe('?');
  });
});

describe('time zones', () => {
  // Фиксированная зимняя дата, чтобы летнее время не влияло на смещения.
  const winter = new Date('2026-01-15T12:00:00Z');

  it('formats offsets as UTC±HH:MM', () => {
    expect(formatTimeZoneOffset('Europe/Moscow', winter)).toBe('UTC+03:00');
    expect(formatTimeZoneOffset('America/New_York', winter)).toBe('UTC-05:00');
    expect(formatTimeZoneOffset('UTC', winter)).toBe('UTC+00:00');
    expect(formatTimeZoneOffset('Asia/Kolkata', winter)).toBe('UTC+05:30');
  });

  it('returns empty string for unknown zone', () => {
    expect(formatTimeZoneOffset('Nowhere/Unknown', winter)).toBe('');
  });

  it('builds options sorted by offset with city labels', () => {
    const options = buildTimeZoneOptions(winter);
    const values = options.map((o) => o.value);
    expect(values[0]).toBe('Pacific/Honolulu');
    expect(values[values.length - 1]).toBe('Pacific/Auckland');
    expect(options.find((o) => o.value === 'Europe/Moscow')?.content).toBe('(UTC+03:00) Москва');
    expect(new Set(values).size).toBe(values.length);
  });
});
