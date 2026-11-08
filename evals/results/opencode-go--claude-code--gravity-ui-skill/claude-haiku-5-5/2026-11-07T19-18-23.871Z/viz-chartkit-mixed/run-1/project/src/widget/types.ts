import type {ThemeType} from '@gravity-ui/uikit';

/** Режим отображения виджета: обычный линейный график или плотный ряд мониторинга. */
export type WidgetMode = 'sales' | 'monitoring';

/** Одна точка ряда: метка времени (миллисекунды от эпохи) и значение. `null` — пропуск измерения. */
export interface WidgetPoint {
    t: number;
    v: number | null;
}

/** Именованный временной ряд. Один и тот же набор рядов отображается в любом режиме. */
export interface WidgetSeries {
    id: string;
    name: string;
    points: WidgetPoint[];
}

export interface TimeSeriesWidgetProps {
    title: string;
    series: WidgetSeries[];
    /** Управляемый режим. Если не передан, виджет хранит режим сам. */
    mode?: WidgetMode;
    /** Режим при первом показе в неуправляемом варианте. По умолчанию `sales`. */
    defaultMode?: WidgetMode;
    onModeChange?: (mode: WidgetMode) => void;
    /** Высота области графика в пикселях. По умолчанию 360. */
    height?: number;
}

/** Общий контракт, который выполняют оба движка. */
export interface EngineProps {
    series: WidgetSeries[];
    /** Цвета по индексу ряда, уже выбранные для текущей темы. */
    colors: string[];
    themeType: ThemeType;
}
