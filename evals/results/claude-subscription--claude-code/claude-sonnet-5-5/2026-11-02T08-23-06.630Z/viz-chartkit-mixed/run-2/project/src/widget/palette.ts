/**
 * Категориальная палитра, фиксированный порядок (слоты 1–3, light).
 * Проверена validate_palette.js: все проверки PASS, у бирюзового контраст к фону
 * ниже 3:1 — поэтому легенда и тултип с названиями серий обязательны.
 */
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'] as const;

/** Цвет принадлежит серии (по индексу в данных), а не её видимости или рангу. */
export const colorAt = (index: number, explicit?: string): string =>
    explicit ?? SERIES_COLORS[index % SERIES_COLORS.length];
