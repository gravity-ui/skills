import type { SelectOption } from '@gravity-ui/uikit';

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
  { value: 'tr', content: 'Türkçe' },
  { value: 'kk', content: 'Қазақша' },
];

/** Used when the runtime doesn't support Intl.supportedValuesOf. */
const FALLBACK_TIME_ZONES = [
  'Pacific/Honolulu',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Kaliningrad',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Asia/Dubai',
  'Europe/Samara',
  'Asia/Yekaterinburg',
  'Asia/Almaty',
  'Asia/Novosibirsk',
  'Asia/Krasnoyarsk',
  'Asia/Irkutsk',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Yakutsk',
  'Asia/Vladivostok',
  'Australia/Sydney',
  'Asia/Magadan',
  'Asia/Kamchatka',
];

function getUtcOffsetMinutes(timeZone: string, date: Date): number {
  // "GMT+03:00" / "GMT-09:30" / "GMT" (for UTC itself)
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${hh}:${mm}`;
}

function buildTimeZoneOptions(): SelectOption[] {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: 'timeZone') => string[] };
  const zones = intl.supportedValuesOf ? intl.supportedValuesOf('timeZone') : FALLBACK_TIME_ZONES;
  const list = zones.includes('UTC') ? zones : ['UTC', ...zones];
  const now = new Date();

  return list
    .map((zone) => {
      let offset: number;
      try {
        offset = getUtcOffsetMinutes(zone, now);
      } catch {
        return null;
      }
      const city = zone.replace(/_/g, ' ');
      const text = `(${formatOffset(offset)}) ${city}`;
      return { zone, offset, text };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.offset - b.offset || a.zone.localeCompare(b.zone))
    .map(({ zone, text }) => ({ value: zone, content: text, text }));
}

export const TIME_ZONE_OPTIONS = buildTimeZoneOptions();

export function getBrowserTimeZone(): string {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return TIME_ZONE_OPTIONS.some((o) => o.value === tz) ? tz : 'UTC';
}
