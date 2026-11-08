export const NOTIFICATION_KEYS = ['productNews', 'systemAlerts', 'weeklyDigest'] as const;
export type NotificationKey = (typeof NOTIFICATION_KEYS)[number];

export const NOTIFICATION_LABELS: Record<NotificationKey, string> = {
  productNews: 'Новости продукта',
  systemAlerts: 'Системные алерты',
  weeklyDigest: 'Дайджест за неделю',
};

export interface ProfileValues {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: Record<NotificationKey, boolean>;
}

export type ProfileErrors = Partial<Record<'name' | 'email', string>>;

export const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
];

const FALLBACK_TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Tokyo',
  'America/New_York',
  'America/Los_Angeles',
];

/** Полный список IANA-зон из окружения; запасной короткий список для старых движков. */
export const TIMEZONE_OPTIONS: string[] =
  typeof Intl.supportedValuesOf === 'function' && Intl.supportedValuesOf('timeZone').length > 0
    ? Intl.supportedValuesOf('timeZone')
    : FALLBACK_TIMEZONES;

export const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_TYPES.includes(file.type)) return 'Допустимые форматы: PNG, JPEG, WebP, GIF';
  if (file.size > AVATAR_MAX_BYTES) return 'Файл больше 2 МБ';
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfile(values: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {};
  const name = values.name.trim();
  if (!name) {
    errors.name = 'Укажите имя';
  } else if (name.length > 100) {
    errors.name = 'Не длиннее 100 символов';
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Введите корректный email';
  }
  return errors;
}

export function isProfileEqual(a: ProfileValues, b: ProfileValues): boolean {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.avatarUrl === b.avatarUrl &&
    a.language === b.language &&
    a.timezone === b.timezone &&
    a.twoFactorEnabled === b.twoFactorEnabled &&
    NOTIFICATION_KEYS.every((key) => a.notifications[key] === b.notifications[key])
  );
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => Array.from(part)[0].toUpperCase())
    .join('');
}
