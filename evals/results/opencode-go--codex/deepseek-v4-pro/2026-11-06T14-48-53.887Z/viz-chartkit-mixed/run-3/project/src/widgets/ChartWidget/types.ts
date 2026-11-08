import type {ReactNode} from 'react';

/** Два режима отображения виджета. */
export type ChartMode = 'sales' | 'monitor';

/** Одна точка данных для графика продаж. */
export interface SalesPoint {
  label: string;
  value: number;
}

/** Одна точка данных для мониторинга — плотный временной ряд. */
export interface MonitorPoint {
  ts: number;   // unix ms
  value: number;
}

/** Единый контракт данных, принимаемый виджетом. */
export interface ChartWidgetData {
  sales: SalesPoint[];
  monitor: MonitorPoint[];
}

/** Пропсы виджета. */
export interface ChartWidgetProps {
  data: ChartWidgetData;
  initialMode?: ChartMode;
  className?: string;
}

/** Контракт движка графика: функция-рендерер, принимающая данные. */
export type ChartEngine<P> = (props: P & {className?: string}) => ReactNode;

/** Пропсы движка продаж. */
export interface SalesEngineProps {
  data: SalesPoint[];
  className?: string;
}

/** Пропсы движка мониторинга. */
export interface MonitorEngineProps {
  data: MonitorPoint[];
  className?: string;
}
