import type {ChartKitPlugin, ChartKitType, ChartKitWidget} from '@gravity-ui/chartkit';

/** Режим виджета. Определяет, какой движок графиков будет использован. */
export type ChartWidgetMode = 'sales' | 'monitoring';

export const CHART_WIDGET_MODES: readonly ChartWidgetMode[] = ['sales', 'monitoring'];

/** Точка временного ряда: `x` — unix-время в миллисекундах, `y` — значение или пропуск. */
export interface TimeSeriesPoint {
    x: number;
    y: number | null;
}

export interface TimeSeries {
    id: string;
    name: string;
    points: TimeSeriesPoint[];
}

/**
 * Единый формат данных виджета. Оба режима принимают именно его,
 * а адаптация под конкретный движок происходит внутри ленивого модуля движка.
 */
export interface TimeSeriesDataset {
    series: TimeSeries[];
    /** Подпись оси значений, например «Выручка, ₽». */
    valueLabel?: string;
    /** Единица измерения для подписей значений, например «%» или «₽». */
    unit?: string;
    /** Количество знаков после запятой в подписях значений. */
    precision?: number;
    /** Таймзона оси времени и подсказок (например, «Europe/Moscow»). */
    timeZone?: string;
}

/** Данные можно передать одним набором на оба режима или отдельным набором на каждый. */
export type ChartWidgetData = TimeSeriesDataset | Partial<Record<ChartWidgetMode, TimeSeriesDataset>>;

export type ChartWidgetTheme = 'light' | 'dark';

export interface ChartWidgetProps {
    data: ChartWidgetData;
    /** Управляемый режим. */
    mode?: ChartWidgetMode;
    /** Начальный режим для неуправляемого использования. */
    defaultMode?: ChartWidgetMode;
    onModeChange?: (mode: ChartWidgetMode) => void;
    title?: string;
    /** Высота области графика в пикселях. */
    height?: number;
    /** Подписи переключателя режимов. */
    modeLabels?: Partial<Record<ChartWidgetMode, string>>;
    className?: string;
}

/** Контекст, который виджет передаёт движку при сборке конфигурации. */
export interface EngineContext {
    theme: ChartWidgetTheme;
    /** Цвета серий в фиксированном порядке (слот → серия). */
    colors: string[];
    lang: 'ru' | 'en';
}

/**
 * Движок графика — связка плагина ChartKit и адаптера данных.
 * Модуль движка загружается лениво через `loadEngine`.
 */
export interface ChartEngine<T extends ChartKitType = ChartKitType> {
    mode: ChartWidgetMode;
    /** Тип плагина ChartKit, под которым рендерится график. */
    type: T;
    /** Плагин ChartKit, регистрируемый при первой загрузке движка. */
    plugin: ChartKitPlugin;
    /** Преобразует единый формат данных в данные конкретного плагина. */
    buildData: (dataset: TimeSeriesDataset, ctx: EngineContext) => ChartKitWidget[T]['data'];
}

export type AnyChartEngine = ChartEngine<'gravity-charts'> | ChartEngine<'yagr'>;
