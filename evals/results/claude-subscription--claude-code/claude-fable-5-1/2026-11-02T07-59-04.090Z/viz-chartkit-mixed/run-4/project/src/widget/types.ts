import type {ChartKitProps, ChartKitType} from '@gravity-ui/chartkit';

/** Режимы виджета. Каждому режиму соответствует свой движок графиков. */
export type VizMode = 'sales' | 'monitoring';

export const VIZ_MODES: readonly VizMode[] = ['sales', 'monitoring'];

/** Одна точка ряда: метка времени (мс) и значение; `null` — пропуск. */
export interface VizPoint {
    t: number;
    y: number | null;
}

/** Серия в едином формате, не зависящем от движка. */
export interface VizSeries {
    id: string;
    name: string;
    points: VizPoint[];
}

/** Набор данных для одного режима. */
export interface VizDataset {
    series: VizSeries[];
    /** Подпись единицы измерения по оси Y (например, «млн ₽» или «%»). */
    unit?: string;
    /** Нижняя граница оси Y. По умолчанию — автоматически. */
    yMin?: number;
    /** Верхняя граница оси Y. По умолчанию — автоматически. */
    yMax?: number;
    /** Часовой пояс для подписи времени. */
    timeZone?: string;
}

export type VizTheme = 'light' | 'dark';

/** Контекст рендера, который виджет передаёт движку. */
export interface VizRenderContext {
    theme: VizTheme;
    /** Фиксированная категориальная палитра: цвет следует за серией, а не за её позицией. */
    palette: readonly string[];
}

/**
 * Движок — адаптер между единым форматом данных виджета и конкретным
 * плагином ChartKit. Загружается лениво по требованию.
 */
export interface VizEngine<T extends ChartKitType = ChartKitType> {
    mode: VizMode;
    /** Тип плагина ChartKit, который этот движок зарегистрировал. */
    chartKitType: T;
    /** Человекочитаемое имя библиотеки — для отладки и демо. */
    library: string;
    /** Необязательная асинхронная подготовка (локали, шрифты). Выполняется один раз при загрузке движка. */
    prepare?: () => Promise<void>;
    /** Преобразует единый датасет в пропсы ChartKit для своего плагина. */
    buildProps(dataset: VizDataset, ctx: VizRenderContext): Pick<ChartKitProps<T>, 'type' | 'data'>;
}

export type VizEngineStatus = 'idle' | 'loading' | 'ready' | 'error';
