export type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export interface ProfileSettings {
  name: string;
  email: string;
  /** Новый аватар, выбранный пользователем; null — аватар не менялся/не задан. */
  avatar: File | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: Record<NotificationKey, boolean>;
}

export type ProfileErrors = Partial<Record<'name' | 'email', string>>;

export const INITIAL_PROFILE: ProfileSettings = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
  avatar: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

export const LANGUAGE_OPTIONS = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'},
];

const TIMEZONES = [
  {value: 'Europe/Kaliningrad', city: 'Калининград'},
  {value: 'Europe/Moscow', city: 'Москва'},
  {value: 'Europe/Samara', city: 'Самара'},
  {value: 'Asia/Yekaterinburg', city: 'Екатеринбург'},
  {value: 'Asia/Omsk', city: 'Омск'},
  {value: 'Asia/Krasnoyarsk', city: 'Красноярск'},
  {value: 'Asia/Irkutsk', city: 'Иркутск'},
  {value: 'Asia/Vladivostok', city: 'Владивосток'},
  {value: 'Europe/London', city: 'Лондон'},
  {value: 'Europe/Berlin', city: 'Берлин'},
  {value: 'America/New_York', city: 'Нью-Йорк'},
  {value: 'UTC', city: 'Всемирное время (UTC)'},
];

/** Текущее смещение зоны берём из Intl, чтобы подпись не устаревала при смене летнего времени. */
function getUtcOffsetLabel(timeZone: string): string {
  const part = new Intl.DateTimeFormat('en-US', {timeZone, timeZoneName: 'shortOffset'})
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName');
  return part ? part.value.replace('GMT', 'UTC') : '';
}

export const TIMEZONE_OPTIONS = TIMEZONES.map(({value, city}) => {
  const offset = getUtcOffsetLabel(value);
  return {value, content: offset ? `${city}, ${offset}` : city};
});

export const NOTIFICATION_OPTIONS: {key: NotificationKey; label: string}[] = [
  {key: 'productNews', label: 'Новости продукта'},
  {key: 'systemAlerts', label: 'Системные алерты'},
  {key: 'weeklyDigest', label: 'Дайджест за неделю'},
];

export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfile(values: ProfileSettings): ProfileErrors {
  const errors: ProfileErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Введите имя';
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Введите корректный email';
  }

  return errors;
}

/** Возвращает текст ошибки для файла аватара или null, если файл подходит. */
export function validateAvatarFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Можно загрузить только изображение';
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return 'Файл больше 2 МБ';
  }
  return null;
}
