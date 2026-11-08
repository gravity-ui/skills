/** Режим отображения виджета. */
export type ChartWidgetMode = 'sales' | 'monitoring';

/** Точка временного ряда: [timestamp в мс, значение]. `null` — пропуск (нет данных). */
export type TimePoint = [timestamp: number, value: number | null];

export interface TimeSeries {
    id: string;
    name: string;
    points: TimePoint[];
}

/**
 * Единый формат данных для обоих режимов: виджет сам решает,
 * каким движком и с какими настройками их нарисовать.
 */
export interface ChartWidgetDataset {
    title: string;
    series: TimeSeries[];
    /** Единица измерения значений, например `₽` или `ms`. */
    unit?: string;
    /** Знаков после запятой в подписях и тултипе. */
    precision?: number;
}

export type ChartWidgetDatasets = Record<ChartWidgetMode, ChartWidgetDataset>;
