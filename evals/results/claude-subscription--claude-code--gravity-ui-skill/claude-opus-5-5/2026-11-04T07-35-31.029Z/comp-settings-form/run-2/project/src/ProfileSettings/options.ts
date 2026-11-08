import type {SelectOption} from '@gravity-ui/uikit';

export const LANGUAGE_OPTIONS: SelectOption[] = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
    {value: 'de', content: 'Deutsch'},
    {value: 'fr', content: 'Français'},
    {value: 'es', content: 'Español'},
    {value: 'tr', content: 'Türkçe'},
    {value: 'zh', content: '中文'},
];

const TIMEZONES: Array<[zone: string, offset: string, city: string]> = [
    ['Pacific/Honolulu', '−10:00', 'Гонолулу'],
    ['America/Los_Angeles', '−08:00', 'Лос-Анджелес'],
    ['America/New_York', '−05:00', 'Нью-Йорк'],
    ['America/Sao_Paulo', '−03:00', 'Сан-Паулу'],
    ['UTC', '±00:00', 'UTC'],
    ['Europe/London', '±00:00', 'Лондон'],
    ['Europe/Berlin', '+01:00', 'Берлин'],
    ['Europe/Kaliningrad', '+02:00', 'Калининград'],
    ['Europe/Moscow', '+03:00', 'Москва'],
    ['Europe/Samara', '+04:00', 'Самара'],
    ['Asia/Dubai', '+04:00', 'Дубай'],
    ['Asia/Yekaterinburg', '+05:00', 'Екатеринбург'],
    ['Asia/Almaty', '+05:00', 'Алматы'],
    ['Asia/Omsk', '+06:00', 'Омск'],
    ['Asia/Novosibirsk', '+07:00', 'Новосибирск'],
    ['Asia/Krasnoyarsk', '+07:00', 'Красноярск'],
    ['Asia/Irkutsk', '+08:00', 'Иркутск'],
    ['Asia/Shanghai', '+08:00', 'Шанхай'],
    ['Asia/Tokyo', '+09:00', 'Токио'],
    ['Asia/Yakutsk', '+09:00', 'Якутск'],
    ['Asia/Vladivostok', '+10:00', 'Владивосток'],
    ['Asia/Magadan', '+11:00', 'Магадан'],
    ['Asia/Kamchatka', '+12:00', 'Петропавловск-Камчатский'],
];

export const TIMEZONE_OPTIONS: SelectOption[] = TIMEZONES.map(([zone, offset, city]) => ({
    value: zone,
    // `text` is used by the Select filter, `content` is what gets rendered.
    text: `UTC${offset} ${city} ${zone}`,
    content: `(UTC${offset}) ${city}`,
}));

export type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export const NOTIFICATION_OPTIONS: Array<{key: NotificationKey; title: string; hint: string}> = [
    {key: 'productNews', title: 'Новости продукта', hint: 'Анонсы новых функций и обновлений'},
    {key: 'systemAlerts', title: 'Системные алерты', hint: 'Инциденты, вход с нового устройства, изменения безопасности'},
    {key: 'weeklyDigest', title: 'Дайджест за неделю', hint: 'Краткая сводка активности по понедельникам'},
];
