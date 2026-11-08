/** Режимы визуализации, доступные в виджете. */
export type VisualizationMode = 'sales' | 'monitoring';

/** Один временной ряд. `values[i]` соответствует `timestamps[i]` датасета; `null` — пропуск. */
export interface TimeSeries {
    id: string;
    name: string;
    values: Array<number | null>;
}

/**
 * Единый формат данных виджета — одинаковый для обоих режимов.
 * Виджет сам преобразует его в формат нужного движка (gravity-charts или yagr).
 */
export interface TimeSeriesDataset {
    /** Метки времени в миллисекундах (Unix epoch), по возрастанию. */
    timestamps: number[];
    series: TimeSeries[];
    /** Единица измерения значений — подпись оси Y. */
    unit?: string;
}

export interface VisualizationWidgetProps {
    title: string;
    /** Данные для каждого режима в едином формате. */
    datasets: Record<VisualizationMode, TimeSeriesDataset>;
    /** Контролируемый режим. Если не задан — виджет хранит режим сам. */
    mode?: VisualizationMode;
    /** Стартовый режим для неконтролируемого варианта. */
    defaultMode?: VisualizationMode;
    onModeChange?: (mode: VisualizationMode) => void;
    /** Высота области графика в px. */
    height?: number;
    /** Внешняя загрузка данных — показывает лоадер вместо графика. */
    loading?: boolean;
    /** Вызывается, когда движок текущего режима отрисовал график. */
    onLoad?: (mode: VisualizationMode) => void;
    /** Вызывается при ошибке движка графика. */
    onError?: (mode: VisualizationMode, error: unknown) => void;
}

/** Императивный API виджета. */
export interface VisualizationWidgetRef {
    /** Пересчитать размеры графика (например, после изменения размеров контейнера). */
    reflow: () => void;
}
