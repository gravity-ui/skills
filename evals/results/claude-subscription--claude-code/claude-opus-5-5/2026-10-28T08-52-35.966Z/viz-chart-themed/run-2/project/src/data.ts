export interface Series {
    id: string;
    name: string;
    values: number[];
}

export const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

// Ежемесячная аудитория по платформам, тыс. пользователей (2026).
export const SERIES: Series[] = [
    {id: 'web', name: 'Web', values: [42, 45, 48, 47, 52, 56, 58, 61, 60, 64, 68, 72]},
    {id: 'android', name: 'Android', values: [30, 33, 35, 38, 41, 43, 47, 50, 54, 57, 60, 63]},
    {id: 'ios', name: 'iOS', values: [18, 19, 22, 24, 25, 28, 30, 31, 34, 36, 38, 41]},
];
