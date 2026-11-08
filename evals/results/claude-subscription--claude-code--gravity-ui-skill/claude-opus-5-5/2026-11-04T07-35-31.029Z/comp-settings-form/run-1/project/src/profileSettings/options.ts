import type {SelectOption} from '@gravity-ui/uikit';

export const LANGUAGE_OPTIONS: SelectOption[] = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
    {value: 'kk', content: 'Қазақша'},
    {value: 'uz', content: 'Oʻzbekcha'},
    {value: 'tr', content: 'Türkçe'},
    {value: 'de', content: 'Deutsch'},
];

const TIMEZONES: Array<{value: string; offset: string; city: string}> = [
    {value: 'Europe/Kaliningrad', offset: '+02:00', city: 'Калининград'},
    {value: 'Europe/Moscow', offset: '+03:00', city: 'Москва'},
    {value: 'Europe/Istanbul', offset: '+03:00', city: 'Стамбул'},
    {value: 'Europe/Samara', offset: '+04:00', city: 'Самара'},
    {value: 'Asia/Dubai', offset: '+04:00', city: 'Дубай'},
    {value: 'Asia/Yekaterinburg', offset: '+05:00', city: 'Екатеринбург'},
    {value: 'Asia/Tashkent', offset: '+05:00', city: 'Ташкент'},
    {value: 'Asia/Almaty', offset: '+05:00', city: 'Алматы'},
    {value: 'Asia/Omsk', offset: '+06:00', city: 'Омск'},
    {value: 'Asia/Novosibirsk', offset: '+07:00', city: 'Новосибирск'},
    {value: 'Asia/Krasnoyarsk', offset: '+07:00', city: 'Красноярск'},
    {value: 'Asia/Irkutsk', offset: '+08:00', city: 'Иркутск'},
    {value: 'Asia/Yakutsk', offset: '+09:00', city: 'Якутск'},
    {value: 'Asia/Vladivostok', offset: '+10:00', city: 'Владивосток'},
    {value: 'Asia/Magadan', offset: '+11:00', city: 'Магадан'},
    {value: 'Asia/Kamchatka', offset: '+12:00', city: 'Петропавловск-Камчатский'},
    {value: 'Europe/London', offset: '+00:00', city: 'Лондон'},
    {value: 'Europe/Berlin', offset: '+01:00', city: 'Берлин'},
    {value: 'America/New_York', offset: '−05:00', city: 'Нью-Йорк'},
    {value: 'America/Los_Angeles', offset: '−08:00', city: 'Лос-Анджелес'},
];

export const TIMEZONE_OPTIONS: SelectOption[] = TIMEZONES.map(({value, offset, city}) => {
    const label = `(UTC${offset}) ${city}`;
    // `text` is used by the Select filter; include the IANA id so it is searchable too.
    return {value, content: label, text: `${label} ${value}`};
});

export type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export const NOTIFICATION_OPTIONS: Array<{key: NotificationKey; title: string; description: string}> = [
    {
        key: 'productNews',
        title: 'Новости продукта',
        description: 'Анонсы новых функций и обновлений',
    },
    {
        key: 'systemAlerts',
        title: 'Системные алерты',
        description: 'Важные события безопасности и состояния аккаунта',
    },
    {
        key: 'weeklyDigest',
        title: 'Дайджест за неделю',
        description: 'Краткая сводка активности раз в неделю',
    },
];
