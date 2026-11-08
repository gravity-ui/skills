/** Единая точка для линейного графика продаж */
export interface DataPoint {
  label: string;
  value: number;
}

/** Точка плотного временного ряда мониторинга */
export interface TimeSeriesPoint {
  ts: number; // unix-мс
  value: number;
  alert?: boolean; // подсветка тревожных значений
}

/** Общий контракт данных для виджета */
export interface WidgetData {
  line: DataPoint[];
  monitor: TimeSeriesPoint[];
}

/** Контракт движка рендеринга — общий для обоих режимов */
export interface ChartEngine {
  render(container: SVGSVGElement, data: WidgetData): void;
  destroy(container: SVGSVGElement): void;
}
