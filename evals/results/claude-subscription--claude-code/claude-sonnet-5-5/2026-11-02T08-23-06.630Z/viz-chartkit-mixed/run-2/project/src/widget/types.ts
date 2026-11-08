/**
 * Единый публичный API виджета. Потребитель не знает, какой движок рисует график:
 * оба режима принимают одну и ту же форму данных и одни и те же пропсы.
 */

export type WidgetMode = 'sales' | 'monitoring';

export interface SeriesInput {
    id: string;
    name: string;
    /** Значения, выровненные по `timeline`. `null` — пропуск (разрыв линии). */
    values: (number | null)[];
    /** Если не задан — берётся из фиксированной палитры по порядку серий. */
    color?: string;
}

export interface TimeSeriesData {
    /** Метки времени в миллисекундах (unix epoch), по возрастанию. */
    timeline: number[];
    series: SeriesInput[];
}

export interface ChartWidgetProps {
    /** Данные обоих режимов. Режим, который не показан, ничего не загружает и не рисует. */
    data: Record<WidgetMode, TimeSeriesData>;
    /** Контролируемый режим. */
    mode?: WidgetMode;
    /** Начальный режим для неконтролируемого использования. */
    defaultMode?: WidgetMode;
    onModeChange?: (mode: WidgetMode) => void;
    /** Заголовок над графиком; можно переопределить для каждого режима. */
    title?: string | Partial<Record<WidgetMode, string>>;
    /** Единица измерения значений (для осей и тултипа), например «₽» или «%». */
    unit?: Partial<Record<WidgetMode, string>>;
    /** Высота области графика, px. */
    height?: number;
    /** Нижняя граница оси Y; по умолчанию 0. */
    yMin?: number;
    /** Верхняя граница оси Y; по умолчанию — автоматически. */
    yMax?: number;
    /** Таймзона оси X, например «UTC» или «Europe/Moscow». */
    timeZone?: string;
    className?: string;
}

export const MODE_LABELS: Record<WidgetMode, string> = {
    sales: 'Продажи',
    monitoring: 'Мониторинг',
};

/** Параметры, общие для адаптеров обоих движков. */
export interface AdapterOptions {
    title?: string;
    unit?: string;
    yMin?: number;
    yMax?: number;
    timeZone?: string;
}
