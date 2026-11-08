/** Режимы виджета. Каждый режим отрисовывается своим движком. */
export type VizMode = 'sales' | 'monitoring';

export interface VizSeries {
  id: string;
  name: string;
  /** Значения, выровненные по `VizDataset.timestamps`. `null` — пропуск. */
  values: (number | null)[];
}

/**
 * Единый формат данных для всех режимов: колоночный, без привязки к движку.
 * Адаптеры каждого движка переводят его в собственный формат.
 */
export interface VizDataset {
  /** Метки времени в миллисекундах Unix, по возрастанию. */
  timestamps: number[];
  series: VizSeries[];
}

/** Контракт, который реализует каждый движок (лениво загружаемый модуль). */
export interface VizEngineProps {
  dataset: VizDataset;
  height: number;
}
