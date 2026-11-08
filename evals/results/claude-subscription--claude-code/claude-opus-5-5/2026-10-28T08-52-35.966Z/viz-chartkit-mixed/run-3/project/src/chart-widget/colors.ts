// Категориальная палитра: цвет закреплён за позицией ряда, а не за его рангом.
// Тёмная тема — отдельно подобранные ступени тех же оттенков.
const CATEGORICAL = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

export type ColorScheme = keyof typeof CATEGORICAL;

export function getSeriesColors(scheme: ColorScheme): string[] {
    return CATEGORICAL[scheme];
}
