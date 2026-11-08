import type { SelectOption } from '@gravity-ui/uikit';

import type { NotificationKey } from './types';

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'uk', content: 'Українська' },
  { value: 'kk', content: 'Қазақша' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
  { value: 'pt', content: 'Português' },
  { value: 'tr', content: 'Türkçe' },
  { value: 'zh', content: '中文' },
  { value: 'ja', content: '日本語' },
];

interface TimeZoneDef {
  id: string;
  city: string;
}

const TIME_ZONES: TimeZoneDef[] = [
  { id: 'Pacific/Honolulu', city: 'Гонолулу' },
  { id: 'America/Anchorage', city: 'Анкоридж' },
  { id: 'America/Los_Angeles', city: 'Лос-Анджелес' },
  { id: 'America/Denver', city: 'Денвер' },
  { id: 'America/Chicago', city: 'Чикаго' },
  { id: 'America/New_York', city: 'Нью-Йорк' },
  { id: 'America/Sao_Paulo', city: 'Сан-Паулу' },
  { id: 'UTC', city: 'UTC' },
  { id: 'Europe/London', city: 'Лондон' },
  { id: 'Europe/Berlin', city: 'Берлин' },
  { id: 'Europe/Paris', city: 'Париж' },
  { id: 'Europe/Warsaw', city: 'Варшава' },
  { id: 'Europe/Kyiv', city: 'Киев' },
  { id: 'Europe/Istanbul', city: 'Стамбул' },
  { id: 'Europe/Moscow', city: 'Москва' },
  { id: 'Europe/Samara', city: 'Самара' },
  { id: 'Asia/Yerevan', city: 'Ереван' },
  { id: 'Asia/Tbilisi', city: 'Тбилиси' },
  { id: 'Asia/Dubai', city: 'Дубай' },
  { id: 'Asia/Yekaterinburg', city: 'Екатеринбург' },
  { id: 'Asia/Tashkent', city: 'Ташкент' },
  { id: 'Asia/Almaty', city: 'Алматы' },
  { id: 'Asia/Omsk', city: 'Омск' },
  { id: 'Asia/Novosibirsk', city: 'Новосибирск' },
  { id: 'Asia/Krasnoyarsk', city: 'Красноярск' },
  { id: 'Asia/Kolkata', city: 'Мумбаи' },
  { id: 'Asia/Irkutsk', city: 'Иркутск' },
  { id: 'Asia/Bangkok', city: 'Бангкок' },
  { id: 'Asia/Shanghai', city: 'Шанхай' },
  { id: 'Asia/Singapore', city: 'Сингапур' },
  { id: 'Asia/Yakutsk', city: 'Якутск' },
  { id: 'Asia/Tokyo', city: 'Токио' },
  { id: 'Asia/Vladivostok', city: 'Владивосток' },
  { id: 'Australia/Sydney', city: 'Сидней' },
  { id: 'Asia/Magadan', city: 'Магадан' },
  { id: 'Asia/Kamchatka', city: 'Петропавловск-Камчатский' },
  { id: 'Pacific/Auckland', city: 'Окленд' },
];

/**
 * Возвращает смещение зоны относительно UTC в виде «UTC+03:00».
 * Если среда не поддерживает `longOffset` или зона неизвестна — пустая строка.
 */
export function formatTimeZoneOffset(timeZone: string, date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const raw = parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
    if (!raw) return '';
    if (raw === 'GMT' || raw === 'UTC') return 'UTC+00:00';
    return raw.replace(/^GMT/, 'UTC');
  } catch {
    return '';
  }
}

/** Числовое смещение в минутах — нужно только для сортировки списка. */
function offsetMinutes(timeZone: string, date: Date): number {
  const formatted = formatTimeZoneOffset(timeZone, date);
  const match = /UTC([+-])(\d{2}):(\d{2})/.exec(formatted);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

export function buildTimeZoneOptions(date: Date = new Date()): SelectOption[] {
  return [...TIME_ZONES]
    .sort((a, b) => offsetMinutes(a.id, date) - offsetMinutes(b.id, date))
    .map(({ id, city }) => {
      const offset = formatTimeZoneOffset(id, date);
      const label = offset ? `(${offset}) ${city}` : city;
      return { value: id, content: label, text: `${label} ${id}` };
    });
}

export const NOTIFICATION_OPTIONS: Array<{
  key: NotificationKey;
  title: string;
  description: string;
}> = [
  {
    key: 'productNews',
    title: 'Новости продукта',
    description: 'Анонсы новых функций и обновлений.',
  },
  {
    key: 'systemAlerts',
    title: 'Системные алерты',
    description: 'Сбои, инциденты и важные уведомления о безопасности аккаунта.',
  },
  {
    key: 'weeklyDigest',
    title: 'Дайджест за неделю',
    description: 'Сводка активности раз в неделю, по понедельникам.',
  },
];
