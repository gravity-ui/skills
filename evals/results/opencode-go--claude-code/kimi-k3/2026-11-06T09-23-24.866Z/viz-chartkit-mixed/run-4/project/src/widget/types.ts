/**
 * Единый API виджета визуализации.
 *
 * Виджету передаётся набор режимов (`modes`), каждый режим описывается
 * единообразным `VizModeConfig` — временная ось, ряды, единицы, табличное
 * представление. Отрисовкой занимается движок (`ChartEngine`), который
 * подгружается лениво по `kind` режима; смена режима для пользователя API
 * ничем не отличается — только значением `mode`.
 */

export type VizKind = 'sales' | 'monitoring';

export interface VizSeries {
  id: string;
  /** Название ряда — недоверенные данные, выводится только как текст. */
  name: string;
  /** Слот категориальной палитры (фиксированный порядок, цвет следует за сущностью). */
  colorSlot: 1 | 2 | 3;
  values: number[];
}

export interface VizTableRow {
  label: string;
  values: (number | null)[];
}

export interface VizModeConfig {
  kind: VizKind;
  /** Подпись в переключателе режимов. */
  label: string;
  title: string;
  subtitle?: string;
  /** Единица значений: '₽', 'мс', … */
  unit: string;
  /** Метки времени (epoch ms), по возрастанию; длина === values каждого ряда. */
  times: number[];
  series: VizSeries[];
  /** Готовые строки табличного вида (для плотных рядов — агрегаты). */
  tableRows?: VizTableRow[];
  tableNote?: string;
}

/* ── Контракт движка (внутренний, общий для всех ленивых движков) ── */

export interface EngineTokens {
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  gridline: string;
  baseline: string;
  series: [string, string, string];
}

export interface EngineView {
  times: number[];
  series: VizSeries[];
  /** Разрешённые из токенов цвета рядов (по colorSlot). */
  colors: string[];
  tokens: EngineTokens;
  width: number;
  height: number;
  formatXTick: (t: number) => string;
  formatYTick: (v: number) => string;
  formatPoint: (v: number) => string;
}

/** Координаты в пикселях внутри области построения — якорь тултипа. */
export interface EngineHover {
  index: number;
  x: number;
  y: number;
}

export interface EngineContext {
  plotEl: HTMLElement;
  onHover: (hover: EngineHover | null) => void;
}

export interface ChartEngine {
  update(view: EngineView): void;
  resize(width: number, height: number): void;
  setCursor(index: number | null): void;
  getAnchor(index: number): {x: number; y: number};
  destroy(): void;
}

export type EngineFactory = (ctx: EngineContext) => ChartEngine;
