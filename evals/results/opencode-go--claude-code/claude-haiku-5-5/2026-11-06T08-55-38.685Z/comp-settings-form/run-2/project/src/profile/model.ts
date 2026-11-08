export type EmailNotification = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export interface ProfileSettings {
  name: string;
  email: string;
  /** Data URL or object URL of the current avatar; `null` shows initials. */
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  emailNotifications: EmailNotification[];
}

export interface ProfileErrors {
  name?: string;
  email?: string;
}

export const AVATAR_ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const LANGUAGE_OPTIONS = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
];

export const TIMEZONE_OPTIONS = [
  { value: 'Europe/Kaliningrad', content: 'Europe/Kaliningrad (UTC+2)' },
  { value: 'Europe/Moscow', content: 'Europe/Moscow (UTC+3)' },
  { value: 'Europe/Samara', content: 'Europe/Samara (UTC+4)' },
  { value: 'Asia/Yekaterinburg', content: 'Asia/Yekaterinburg (UTC+5)' },
  { value: 'Asia/Novosibirsk', content: 'Asia/Novosibirsk (UTC+7)' },
  { value: 'Asia/Vladivostok', content: 'Asia/Vladivostok (UTC+10)' },
  { value: 'Europe/London', content: 'Europe/London (UTC+0)' },
  { value: 'Europe/Berlin', content: 'Europe/Berlin (UTC+1)' },
  { value: 'America/New_York', content: 'America/New_York (UTC−5)' },
  { value: 'America/Los_Angeles', content: 'America/Los_Angeles (UTC−8)' },
  { value: 'Asia/Tokyo', content: 'Asia/Tokyo (UTC+9)' },
  { value: 'UTC', content: 'UTC' },
];

export const EMAIL_NOTIFICATION_OPTIONS: { value: EmailNotification; label: string }[] = [
  { value: 'productNews', label: 'Новости продукта' },
  { value: 'systemAlerts', label: 'Системные алерты' },
  { value: 'weeklyDigest', label: 'Дайджест за неделю' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfile(values: ProfileSettings): ProfileErrors {
  const errors: ProfileErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name) {
    errors.name = 'Укажите имя';
  } else if (name.length > 64) {
    errors.name = 'Не длиннее 64 символов';
  }

  if (!email) {
    errors.email = 'Укажите email';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Некорректный email';
  }

  return errors;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}
