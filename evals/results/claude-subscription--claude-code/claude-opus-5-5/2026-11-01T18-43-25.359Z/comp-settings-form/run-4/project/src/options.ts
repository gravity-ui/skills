import type { SelectOption } from '@gravity-ui/uikit';

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
  { value: 'kk', content: 'Қазақ тілі' },
  { value: 'uk', content: 'Українська' },
];

const TIMEZONES: Array<[id: string, offset: string, city: string]> = [
  ['Pacific/Honolulu', 'UTC−10:00', 'Гонолулу'],
  ['America/Los_Angeles', 'UTC−08:00', 'Лос-Анджелес'],
  ['America/New_York', 'UTC−05:00', 'Нью-Йорк'],
  ['America/Sao_Paulo', 'UTC−03:00', 'Сан-Паулу'],
  ['Etc/UTC', 'UTC±00:00', 'Всемирное время'],
  ['Europe/London', 'UTC±00:00', 'Лондон'],
  ['Europe/Berlin', 'UTC+01:00', 'Берлин'],
  ['Europe/Kaliningrad', 'UTC+02:00', 'Калининград'],
  ['Europe/Moscow', 'UTC+03:00', 'Москва'],
  ['Europe/Samara', 'UTC+04:00', 'Самара'],
  ['Asia/Dubai', 'UTC+04:00', 'Дубай'],
  ['Asia/Yekaterinburg', 'UTC+05:00', 'Екатеринбург'],
  ['Asia/Almaty', 'UTC+05:00', 'Алматы'],
  ['Asia/Omsk', 'UTC+06:00', 'Омск'],
  ['Asia/Novosibirsk', 'UTC+07:00', 'Новосибирск'],
  ['Asia/Krasnoyarsk', 'UTC+07:00', 'Красноярск'],
  ['Asia/Irkutsk', 'UTC+08:00', 'Иркутск'],
  ['Asia/Shanghai', 'UTC+08:00', 'Шанхай'],
  ['Asia/Tokyo', 'UTC+09:00', 'Токио'],
  ['Asia/Yakutsk', 'UTC+09:00', 'Якутск'],
  ['Asia/Vladivostok', 'UTC+10:00', 'Владивосток'],
  ['Asia/Magadan', 'UTC+11:00', 'Магадан'],
  ['Asia/Kamchatka', 'UTC+12:00', 'Петропавловск-Камчатский'],
];

export const TIMEZONE_OPTIONS: SelectOption[] = TIMEZONES.map(([id, offset, city]) => ({
  value: id,
  // `text` is used by the built-in filter; `content` is what gets rendered.
  text: `${offset} ${city} ${id}`,
  content: `(${offset}) ${city}`,
}));

export type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export const NOTIFICATION_OPTIONS: Array<{ key: NotificationKey; label: string; hint: string }> = [
  { key: 'productNews', label: 'Новости продукта', hint: 'Анонсы новых функций и обновлений' },
  { key: 'systemAlerts', label: 'Системные алерты', hint: 'Важные события безопасности и сбои' },
  { key: 'weeklyDigest', label: 'Дайджест за неделю', hint: 'Сводка активности раз в неделю' },
];
