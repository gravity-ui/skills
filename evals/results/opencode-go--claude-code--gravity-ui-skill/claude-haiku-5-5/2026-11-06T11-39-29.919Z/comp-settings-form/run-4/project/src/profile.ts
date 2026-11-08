export interface NotificationSettings {
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
}

/** Saved profile data (what the server stores). */
export interface ProfileData {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: NotificationSettings;
}

export interface ProfileSaveRequest {
  profile: ProfileData;
  avatarFile: File | null;
}

export interface ProfileErrors {
  name?: string;
  email?: string;
}

export const LANGUAGE_OPTIONS = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'},
];

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getTimezoneOptions(): {value: string; content: string}[] {
  const zones =
    typeof Intl.supportedValuesOf === 'function'
      ? Intl.supportedValuesOf('timeZone')
      : ['UTC'];
  return zones.map((zone) => ({value: zone, content: zone}));
}

export function validateProfile(profile: Pick<ProfileData, 'name' | 'email'>): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!profile.name.trim()) {
    errors.name = 'Введите имя';
  }
  if (!EMAIL_RE.test(profile.email.trim())) {
    errors.email = 'Введите корректный email';
  }
  return errors;
}

/** Returns an error message for an unsupported avatar file, or null if it is acceptable. */
export function validateAvatarFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Можно загрузить только изображение';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Размер файла не должен превышать 5 МБ';
  }
  return null;
}

export function isSameProfile(a: ProfileData, b: ProfileData): boolean {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.avatarUrl === b.avatarUrl &&
    a.language === b.language &&
    a.timezone === b.timezone &&
    a.twoFactorEnabled === b.twoFactorEnabled &&
    a.notifications.productNews === b.notifications.productNews &&
    a.notifications.systemAlerts === b.notifications.systemAlerts &&
    a.notifications.weeklyDigest === b.notifications.weeklyDigest
  );
}
