import type {ModePalette} from './colors';

/** Режимы виджета. Каждому режиму соответствует лениво загружаемый движок. */
export type WidgetMode = 'sales' | 'monitoring';

/** Точка временного ряда: t — unix-ms, v — значение. */
export interface DataPoint {
  t: number;
  v: number;
}

export interface ChartSeries {
  id: string;
  /** Имя серии — недоверенные данные: рендерится только как текст. */
  name: string;
  points: DataPoint[];
}

/** Серия с назначенным цветом (слот палитры по индексу, без циклирования). */
export interface ResolvedSeries extends ChartSeries {
  color: string;
}

/**
 * Единый публичный API виджета. Оба режима принимают одну и ту же модель данных —
 * ряды точек {t, v}; режим выбирает только движок рендеринга.
 */
export interface ChartWidgetProps {
  mode: WidgetMode;
  title: string;
  subtitle?: string;
  series: ChartSeries[];
  height?: number;
  yTickFormat?: (v: number) => string;
  xTickFormat?: (t: number) => string;
  tooltipValueFormat?: (v: number) => string;
  tooltipXFormat?: (t: number) => string;
}

/** Пропсы, с которыми виджет вызывает движок: цвета и форматтеры уже разрешены. */
export interface EngineProps {
  series: ResolvedSeries[];
  height: number;
  palette: ModePalette;
  yTickFormat: (v: number) => string;
  xTickFormat: (t: number) => string;
  tooltipValueFormat: (v: number) => string;
  tooltipXFormat: (t: number) => string;
}
