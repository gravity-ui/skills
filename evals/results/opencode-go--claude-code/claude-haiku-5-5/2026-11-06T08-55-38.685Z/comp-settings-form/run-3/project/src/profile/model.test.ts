import { describe, expect, it } from 'vitest';

import {
  AVATAR_MAX_BYTES,
  getInitials,
  isProfileEqual,
  validateAvatarFile,
  validateProfile,
} from './model';
import type { ProfileValues } from './model';

const BASE: ProfileValues = {
  name: 'Анна Смирнова',
  email: 'anna@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: { productNews: true, systemAlerts: true, weeklyDigest: false },
};

describe('validateProfile', () => {
  it('accepts valid values', () => {
    expect(validateProfile(BASE)).toEqual({});
  });

  it('requires a non-blank name', () => {
    expect(validateProfile({ ...BASE, name: '   ' }).name).toBeDefined();
  });

  it('rejects names longer than 100 characters', () => {
    expect(validateProfile({ ...BASE, name: 'а'.repeat(101) }).name).toBeDefined();
  });

  it('rejects malformed emails', () => {
    expect(validateProfile({ ...BASE, email: 'anna@' }).email).toBeDefined();
    expect(validateProfile({ ...BASE, email: 'anna example.com' }).email).toBeDefined();
    expect(validateProfile({ ...BASE, email: '' }).email).toBeDefined();
  });
});

describe('validateAvatarFile', () => {
  it('accepts supported image types under the size limit', () => {
    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    expect(validateAvatarFile(file)).toBeNull();
  });

  it('rejects unsupported types', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    expect(validateAvatarFile(file)).not.toBeNull();
  });

  it('rejects files over the size limit', () => {
    const file = new File(['x'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: AVATAR_MAX_BYTES + 1 });
    expect(validateAvatarFile(file)).not.toBeNull();
  });
});

describe('isProfileEqual', () => {
  it('treats identical values as equal', () => {
    expect(isProfileEqual(BASE, { ...BASE, notifications: { ...BASE.notifications } })).toBe(true);
  });

  it('detects changes in scalar fields', () => {
    expect(isProfileEqual(BASE, { ...BASE, twoFactorEnabled: true })).toBe(false);
    expect(isProfileEqual(BASE, { ...BASE, language: 'en' })).toBe(false);
  });

  it('detects changes in notification checkboxes', () => {
    const changed = { ...BASE, notifications: { ...BASE.notifications, weeklyDigest: true } };
    expect(isProfileEqual(BASE, changed)).toBe(false);
  });
});

describe('getInitials', () => {
  it('uses the first letters of up to two words', () => {
    expect(getInitials('Анна Смирнова')).toBe('АС');
    expect(getInitials('John Ronald Reuel Tolkien')).toBe('JR');
  });

  it('handles single words, extra spaces and empty input', () => {
    expect(getInitials('  anna  ')).toBe('A');
    expect(getInitials('   ')).toBe('?');
  });
});
