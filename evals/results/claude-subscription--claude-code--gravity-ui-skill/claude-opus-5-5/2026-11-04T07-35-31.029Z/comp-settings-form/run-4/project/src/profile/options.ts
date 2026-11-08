import type {SelectOption} from '@gravity-ui/uikit';

export const LANGUAGE_OPTIONS: SelectOption[] = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
    {value: 'de', content: 'Deutsch'},
    {value: 'fr', content: 'Français'},
    {value: 'es', content: 'Español'},
    {value: 'tr', content: 'Türkçe'},
    {value: 'kk', content: 'Қазақ тілі'},
];

const FALLBACK_TIME_ZONES = [
    'UTC',
    'Europe/Kaliningrad',
    'Europe/Moscow',
    'Europe/Samara',
    'Asia/Yekaterinburg',
    'Asia/Omsk',
    'Asia/Novosibirsk',
    'Asia/Krasnoyarsk',
    'Asia/Irkutsk',
    'Asia/Yakutsk',
    'Asia/Vladivostok',
    'Asia/Magadan',
    'Asia/Kamchatka',
    'Europe/London',
    'Europe/Berlin',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
];

function getTimeZones(): string[] {
    try {
        const zones = Intl.supportedValuesOf('timeZone');
        return zones.includes('UTC') ? zones : ['UTC', ...zones];
    } catch {
        return FALLBACK_TIME_ZONES;
    }
}

/** Offset in minutes from UTC for the given zone at the current moment. */
function getOffsetMinutes(timeZone: string, date: Date): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'longOffset',
    }).formatToParts(date);
    const name = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
    const match = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name);
    if (!match) {
        return 0;
    }
    const sign = match[1] === '-' ? -1 : 1;
    return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
}

function formatOffset(minutes: number): string {
    const sign = minutes < 0 ? '−' : '+';
    const abs = Math.abs(minutes);
    const hours = String(Math.floor(abs / 60)).padStart(2, '0');
    const mins = String(abs % 60).padStart(2, '0');
    return `UTC${sign}${hours}:${mins}`;
}

function buildTimeZoneOptions(): SelectOption[] {
    const now = new Date();
    return getTimeZones()
        .map((zone) => ({zone, offset: getOffsetMinutes(zone, now)}))
        .sort((a, b) => a.offset - b.offset || a.zone.localeCompare(b.zone))
        .map(({zone, offset}) => {
            const label = `(${formatOffset(offset)}) ${zone.replace(/_/g, ' ')}`;
            // `text` is what the filter searches by.
            return {value: zone, content: label, text: label};
        });
}

export const TIME_ZONE_OPTIONS = buildTimeZoneOptions();

export function getBrowserTimeZone(): string {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIME_ZONE_OPTIONS.some((option) => option.value === zone) ? zone : 'UTC';
}

export type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export const NOTIFICATION_OPTIONS: {key: NotificationKey; title: string; description: string}[] = [
    {
        key: 'productNews',
        title: 'Новости продукта',
        description: 'Анонсы новых функций и обновлений',
    },
    {
        key: 'systemAlerts',
        title: 'Системные алерты',
        description: 'Инциденты, плановые работы и события безопасности',
    },
    {
        key: 'weeklyDigest',
        title: 'Дайджест за неделю',
        description: 'Сводка активности раз в неделю по понедельникам',
    },
];
