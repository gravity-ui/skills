/**
 * Единый, не зависящий от движка формат данных виджета.
 * Оба режима принимают одно и то же: общая шкала времени + набор рядов.
 */
export interface ChartWidgetSeries {
    id: string;
    name: string;
    /** Значения, выровненные по `timeline`; `null` — пропуск. */
    values: (number | null)[];
}

export interface ChartWidgetValueFormat {
    /** Знаков после запятой. */
    precision?: number;
    /** Единица измерения после числа: `₽`, `%`, `мс`… */
    unit?: string;
    /** Сокращать большие числа (1,2 млн). */
    compact?: boolean;
}

export interface ChartWidgetData {
    /** Unix-время в миллисекундах. */
    timeline: number[];
    series: ChartWidgetSeries[];
    valueFormat?: ChartWidgetValueFormat;
    /** Фиксированные границы оси Y (например, 0–100 для процентов). */
    yMin?: number;
    yMax?: number;
}

/**
 * Вид отображения — определяет движок:
 * - `line`  — обычный линейный график (@gravity-ui/charts, SVG);
 * - `dense` — плотный временной ряд мониторинга (Yagr/uPlot, canvas).
 */
export type ChartWidgetKind = 'line' | 'dense';

export interface ChartWidgetView<Id extends string = string> {
    id: Id;
    /** Подпись в переключателе. */
    label: string;
    kind: ChartWidgetKind;
    data: ChartWidgetData;
    /** Подзаголовок под переключателем. */
    description?: string;
}
