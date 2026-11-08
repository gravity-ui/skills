/** Режимы виджета: обычный график продаж и плотный временной ряд мониторинга. */
export type VizWidgetMode = 'sales' | 'monitoring';

/** Движок ChartKit, которым рендерится конкретный режим. */
export type VizEngine = 'gravity-charts' | 'yagr';

/** Один ряд данных. Значения выровнены по общему `timeline` набора. */
export interface VizSeries {
    id: string;
    name: string;
    /** Значение на каждую точку `timeline`; `null` — пропуск. */
    values: Array<number | null>;
    color?: string;
}

/** Единый формат данных виджета, не зависящий от движка. */
export interface VizDataset {
    title: string;
    /** Unix-время в миллисекундах, по возрастанию. */
    timeline: number[];
    series: VizSeries[];
    /** Подпись оси значений (например, «₽» или «%»). */
    valueTitle?: string;
    /** Знаков после запятой в подписях и тултипе. */
    precision?: number;
}

export interface VizWidgetProps {
    /** Данные для каждого режима. */
    datasets: Record<VizWidgetMode, VizDataset>;
    /** Контролируемый режим. */
    mode?: VizWidgetMode;
    /** Начальный режим для неконтролируемого варианта. */
    defaultMode?: VizWidgetMode;
    onModeChange?: (mode: VizWidgetMode) => void;
    /** Высота области графика в px. ChartKit заполняет контейнер, поэтому высота обязательна. */
    height?: number;
    id?: string;
}
