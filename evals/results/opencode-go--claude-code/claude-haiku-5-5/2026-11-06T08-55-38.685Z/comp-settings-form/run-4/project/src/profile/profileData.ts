export type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export interface ProfileValues {
  name: string;
  email: string;
  /** Код языка интерфейса, например 'ru'. */
  language: string;
  /** IANA-идентификатор часового пояса, например 'Europe/Moscow'. */
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: Record<NotificationKey, boolean>;
  /** Текущий аватар: URL с сервера или object URL локально выбранного файла. */
  avatarUrl: string | null;
  /** Файл, выбранный пользователем и ещё не сохранённый. */
  avatarFile: File | null;
}

export type ProfileErrors = Partial<Record<'name' | 'email', string>>;

export const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'zh', label: '中文' },
];

export const TIMEZONE_IDS = [
  'Europe/Kaliningrad',
  'Europe/Moscow',
  'Europe/Samara',
  'Asia/Yekaterinburg',
  'Asia/Omsk',
  'Asia/Krasnoyarsk',
  'Asia/Irkutsk',
  'Asia/Yakutsk',
  'Asia/Vladivostok',
  'Asia/Kamchatka',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Istanbul',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Australia/Sydney',
  'UTC',
];

/** Возвращает строку вида «GMT+03:00 · Europe/Moscow» с текущим смещением (с учётом перехода на летнее время). */
export function formatTimezoneLabel(timeZone: string, date: Date = new Date()): string {
  const offsetPart = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')?.value;
  return `${offsetPart ?? 'GMT'} · ${timeZone}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX_LENGTH = 100;

export function validateProfile(values: Pick<ProfileValues, 'name' | 'email'>): ProfileErrors {
  const errors: ProfileErrors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = 'Введите имя';
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Не длиннее ${NAME_MAX_LENGTH} символов`;
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Введите email';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Некорректный email';
  }

  return errors;
}

export const INITIAL_PROFILE: ProfileValues = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
  avatarUrl: null,
  avatarFile: null,
};

/** Заглушка для сохранения: замените на реальный запрос к API. */
export function saveProfile(values: ProfileValues): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.info('saveProfile', { ...values, avatarFile: values.avatarFile?.name ?? null });
      resolve();
    }, 600);
  });
}
