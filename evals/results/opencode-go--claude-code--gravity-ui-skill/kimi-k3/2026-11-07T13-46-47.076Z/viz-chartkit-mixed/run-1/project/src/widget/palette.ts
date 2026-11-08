/**
 * Категориальная палитра рядов (светлая тема).
 *
 * Порядок слотов фиксирован — hue закреплён за позицией ряда, а не за его
 * рангом. Палитра проверена валидатором dataviz-скилла
 * (scripts/validate_palette.js, mode=light): все шесть проверок PASS,
 * худшая соседняя пара CVD ΔE 9.2, normal-vision ΔE 27.6.
 * Третий слот (aqua) ниже 3:1 к светлой подложке — компенсируется
 * обязательной легендой и тултипом (идентичность не только цветом).
 */
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a'] as const;

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}
