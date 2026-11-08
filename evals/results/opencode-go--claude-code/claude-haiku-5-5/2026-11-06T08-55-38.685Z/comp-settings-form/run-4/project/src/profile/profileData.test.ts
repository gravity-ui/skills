import { describe, expect, it } from 'vitest';

import { formatTimezoneLabel, validateProfile } from './profileData';

describe('validateProfile', () => {
  it('accepts a valid name and email', () => {
    expect(validateProfile({ name: 'Анна', email: 'anna@example.com' })).toEqual({});
  });

  it('requires a non-blank name', () => {
    expect(validateProfile({ name: '   ', email: 'a@b.co' })).toEqual({ name: 'Введите имя' });
  });

  it('rejects names longer than 100 characters', () => {
    const errors = validateProfile({ name: 'x'.repeat(101), email: 'a@b.co' });
    expect(errors.name).toBe('Не длиннее 100 символов');
  });

  it('requires an email', () => {
    expect(validateProfile({ name: 'Анна', email: '' })).toEqual({ email: 'Введите email' });
  });

  it.each(['plain', 'no-at-sign.example.com', 'a@b', 'a b@c.com', 'a@@b.com'])(
    'rejects malformed email %s',
    (email) => {
      expect(validateProfile({ name: 'Анна', email }).email).toBe('Некорректный email');
    },
  );

  it('reports both fields at once', () => {
    expect(validateProfile({ name: '', email: 'bad' })).toEqual({
      name: 'Введите имя',
      email: 'Некорректный email',
    });
  });
});

describe('formatTimezoneLabel', () => {
  it('includes the GMT offset and the IANA id', () => {
    // Январь: Москва всегда UTC+3, без перехода на летнее время.
    const label = formatTimezoneLabel('Europe/Moscow', new Date('2026-01-15T12:00:00Z'));
    expect(label).toBe('GMT+03:00 · Europe/Moscow');
  });

  it('reflects daylight saving time for zones that observe it', () => {
    const winter = formatTimezoneLabel('Europe/Berlin', new Date('2026-01-15T12:00:00Z'));
    const summer = formatTimezoneLabel('Europe/Berlin', new Date('2026-07-15T12:00:00Z'));
    expect(winter).toBe('GMT+01:00 · Europe/Berlin');
    expect(summer).toBe('GMT+02:00 · Europe/Berlin');
  });
});
