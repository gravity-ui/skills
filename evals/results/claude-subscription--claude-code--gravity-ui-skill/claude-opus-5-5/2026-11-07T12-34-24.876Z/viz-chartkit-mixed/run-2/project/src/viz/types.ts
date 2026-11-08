/**
 * Единый (движок-независимый) контракт данных виджета визуализации.
 *
 * Оба режима принимают одинаковый колоночный формат: общая временная шкала
 * + набор серий со значениями, выровненными по этой шкале. Какой движок
 * отрисует данные (gravity-charts или yagr), решает сам виджет по режиму.
 */

export type VisualizationMode = 'sales' | 'monitoring';

export interface TimeSeries {
    id: string;
    name: string;
    /** Значения, выровненные по `timeline`; `null` — разрыв в данных. */
    values: Array<number | null>;
}

export interface TimeSeriesSet {
    /** Временные метки в миллисекундах (Unix epoch), по возрастанию. */
    timeline: number[];
    series: TimeSeries[];
}

export interface VisualizationView {
    /** Подпись режима в переключателе. */
    label: string;
    /** Единица измерения значений (подпись оси Y и тултипа). */
    unit?: string;
    /** Количество знаков после запятой в подписях значений. */
    precision?: number;
    data: TimeSeriesSet;
}

export type VisualizationViews = Record<VisualizationMode, VisualizationView>;

export interface VisualizationWidgetRef {
    /** Перерисовать активный график под текущий размер контейнера. */
    reflow: () => void;
}
