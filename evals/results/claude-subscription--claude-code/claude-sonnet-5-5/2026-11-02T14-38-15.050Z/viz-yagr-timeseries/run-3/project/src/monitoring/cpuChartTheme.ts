import type {YagrTheme} from '@gravity-ui/yagr';

/**
 * Цвета серии CPU. Одна серия — один акцентный (синий) цвет категориальной палитры,
 * подобранный отдельно под светлую и тёмную поверхность (контраст ≥ 3:1 к фону
 * проверен валидатором палитры). Для тёмной темы это не «инверсия», а свой шаг.
 *
 * Цвета осей, сетки и подписей здесь не задаются: они берутся из токенов Gravity UI
 * в CpuChart.css, поэтому график автоматически совпадает с темой приложения.
 */
const LINE_COLOR: Record<'light' | 'dark', string> = {
  light: '#2a78d6',
  dark: '#3987e5',
};

/** Заливка под линией — тот же оттенок с прозрачностью ~10% (подложка, не плашка). */
const FILL_COLOR: Record<'light' | 'dark', string> = {
  light: 'rgba(42, 120, 214, 0.10)',
  dark: 'rgba(57, 135, 229, 0.14)',
};

const YAGR_THEMES: readonly string[] = ['light', 'dark', 'light-hc', 'dark-hc'];

/** Приводит значение темы Gravity (может быть произвольной строкой) к теме Yagr. */
export function toYagrTheme(themeValue: string, fallbackType: 'light' | 'dark'): YagrTheme {
  return (YAGR_THEMES.includes(themeValue) ? themeValue : fallbackType) as YagrTheme;
}

export function getSeriesColors(theme: YagrTheme) {
  const type = theme.startsWith('dark') ? 'dark' : 'light';
  return {color: FILL_COLOR[type], lineColor: LINE_COLOR[type]};
}
