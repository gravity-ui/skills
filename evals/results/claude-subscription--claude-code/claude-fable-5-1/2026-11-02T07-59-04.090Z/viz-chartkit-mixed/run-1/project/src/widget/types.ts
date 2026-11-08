import type {ChartKitPlugin, ChartKitType, ChartKitWidget} from '@gravity-ui/chartkit';

/** Режим виджета: обычный линейный график продаж или плотный временной ряд мониторинга. */
export type VizMode = 'sales' | 'monitoring';

export type VizTheme = 'light' | 'dark';

/** Одна серия. Значения выровнены по общей шкале `VizDataset.timeline`, `null` — пропуск. */
export interface VizSeries {
    id: string;
    name: string;
    values: (number | null)[];
}

/**
 * Единый формат данных виджета. Оба движка получают именно его —
 * преобразование в формат конкретной библиотеки делает адаптер движка.
 */
export interface VizDataset {
    /** Метки времени в миллисекундах Unix epoch, общие для всех серий. */
    timeline: number[];
    series: VizSeries[];
    /** Единица измерения значения — подпись оси Y, тултипа и таблицы. */
    unit?: string;
    /** Число знаков после запятой при отображении значений. */
    precision?: number;
    /** Часовой пояс для подписей оси X и тултипа, например `Europe/Moscow`. */
    timeZone?: string;
}

export interface VizRenderContext {
    theme: VizTheme;
    /** Цвета серий в порядке `dataset.series`. */
    colors: string[];
}

/**
 * Описание движка графиков. Через этот интерфейс виджет работает с любой
 * библиотекой одинаково: лениво загружает плагин ChartKit и строит его данные.
 */
export interface VizEngine<T extends ChartKitType = ChartKitType> {
    /** Тип плагина ChartKit, которым рендерится движок. */
    type: T;
    /** Имя движка для индикации в интерфейсе. */
    label: string;
    /** Ленивая загрузка плагина. Вызывается один раз при первом обращении к режиму. */
    load: () => Promise<ChartKitPlugin>;
    /** Адаптер: единый dataset → данные плагина ChartKit. */
    buildData: (dataset: VizDataset, ctx: VizRenderContext) => ChartKitWidget[T]['data'];
}

export type VizEngineStatus = 'idle' | 'loading' | 'ready' | 'error';
