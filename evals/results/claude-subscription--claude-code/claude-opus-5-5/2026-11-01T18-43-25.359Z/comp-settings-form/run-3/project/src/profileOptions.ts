export const LANGUAGE_OPTIONS = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
    {value: 'de', content: 'Deutsch'},
    {value: 'fr', content: 'Français'},
    {value: 'es', content: 'Español'},
    {value: 'tr', content: 'Türkçe'},
    {value: 'zh', content: '中文'},
];

// IANA-идентификаторы; смещение в подписи — стандартное (без учёта летнего времени).
export const TIMEZONE_OPTIONS = [
    {value: 'Pacific/Honolulu', content: '(UTC−10:00) Гонолулу'},
    {value: 'America/Los_Angeles', content: '(UTC−08:00) Лос-Анджелес'},
    {value: 'America/Denver', content: '(UTC−07:00) Денвер'},
    {value: 'America/Chicago', content: '(UTC−06:00) Чикаго'},
    {value: 'America/New_York', content: '(UTC−05:00) Нью-Йорк'},
    {value: 'America/Sao_Paulo', content: '(UTC−03:00) Сан-Паулу'},
    {value: 'UTC', content: '(UTC+00:00) Всемирное координированное время'},
    {value: 'Europe/London', content: '(UTC+00:00) Лондон'},
    {value: 'Europe/Berlin', content: '(UTC+01:00) Берлин'},
    {value: 'Europe/Paris', content: '(UTC+01:00) Париж'},
    {value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград'},
    {value: 'Europe/Kyiv', content: '(UTC+02:00) Киев'},
    {value: 'Europe/Moscow', content: '(UTC+03:00) Москва'},
    {value: 'Europe/Istanbul', content: '(UTC+03:00) Стамбул'},
    {value: 'Europe/Samara', content: '(UTC+04:00) Самара'},
    {value: 'Asia/Dubai', content: '(UTC+04:00) Дубай'},
    {value: 'Asia/Yerevan', content: '(UTC+04:00) Ереван'},
    {value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург'},
    {value: 'Asia/Tashkent', content: '(UTC+05:00) Ташкент'},
    {value: 'Asia/Almaty', content: '(UTC+05:00) Алматы'},
    {value: 'Asia/Kolkata', content: '(UTC+05:30) Калькутта'},
    {value: 'Asia/Omsk', content: '(UTC+06:00) Омск'},
    {value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск'},
    {value: 'Asia/Krasnoyarsk', content: '(UTC+07:00) Красноярск'},
    {value: 'Asia/Irkutsk', content: '(UTC+08:00) Иркутск'},
    {value: 'Asia/Shanghai', content: '(UTC+08:00) Пекин'},
    {value: 'Asia/Yakutsk', content: '(UTC+09:00) Якутск'},
    {value: 'Asia/Tokyo', content: '(UTC+09:00) Токио'},
    {value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток'},
    {value: 'Australia/Sydney', content: '(UTC+10:00) Сидней'},
    {value: 'Asia/Magadan', content: '(UTC+11:00) Магадан'},
    {value: 'Asia/Kamchatka', content: '(UTC+12:00) Петропавловск-Камчатский'},
];

export const NOTIFICATION_OPTIONS = [
    {
        key: 'productNews',
        label: 'Новости продукта',
        hint: 'Анонсы новых функций и обновлений',
    },
    {
        key: 'systemAlerts',
        label: 'Системные алерты',
        hint: 'Инциденты, плановые работы, вход с нового устройства',
    },
    {
        key: 'weeklyDigest',
        label: 'Дайджест за неделю',
        hint: 'Краткая сводка активности по понедельникам',
    },
] as const;

export type NotificationKey = (typeof NOTIFICATION_OPTIONS)[number]['key'];
