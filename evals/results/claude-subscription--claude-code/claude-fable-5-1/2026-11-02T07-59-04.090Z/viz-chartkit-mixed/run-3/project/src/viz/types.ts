import type {ChartKitProps, ChartKitType} from '@gravity-ui/chartkit';

/** Режим виджета: обычный линейный график продаж или плотный ряд мониторинга. */
export type VizMode = 'sales' | 'monitoring';

/** Движки, которые умеет подключать виджет (типы плагинов ChartKit). */
export type VizEngineType = Extract<ChartKitType, 'gravity-charts' | 'yagr'>;

export type VizTheme = 'light' | 'dark';

export interface VizSeries {
    id: string;
    /** Имя серии для легенды, тултипа и таблицы. */
    name: string;
    /** Значения по точкам `timeline`; `null` — пропуск (разрыв линии). */
    values: Array<number | null>;
    /**
     * Явный цвет серии. Если не задан, берётся слот палитры по позиции серии
     * в наборе — цвет закреплён за сущностью, а не за рангом.
     */
    color?: string;
}

/** Единый формат данных для обоих режимов. */
export interface VizDataset {
    title: string;
    /** Отметки времени в миллисекундах, по возрастанию. */
    timeline: number[];
    series: VizSeries[];
    /** Единица измерения значений (подпись оси Y, суффикс в тултипе и таблице). */
    unit?: string;
    /** Число знаков после запятой при форматировании значений. */
    precision?: number;
}

export interface VizRenderContext {
    theme: VizTheme;
    lang: 'ru' | 'en';
    /** Цвета, уже разрешённые для серий (по слотам палитры или `series.color`). */
    colors: string[];
}

/**
 * Пропсы ChartKit, которые умеет собрать движок. Дистрибутивный условный тип:
 * для объединения движков получается объединение пропсов с дискриминантом `type`.
 */
export type VizChartProps<T extends VizEngineType = VizEngineType> = T extends VizEngineType
    ? ChartKitProps<T>
    : never;

/**
 * Контракт движка. Модуль движка подгружается лениво; статически доступны только
 * эти типы, реестр и загрузчики из `engines/registry.ts`.
 */
export interface VizEngine {
    type: VizEngineType;
    /** Регистрирует плагин в ChartKit (идемпотентно). */
    register(): void;
    /**
     * Переводит единый набор данных в конфигурацию ChartKit для своего движка.
     * Возвращает объединение с дискриминантом `type`; конкретный движок отдаёт свою ветку.
     */
    build(dataset: VizDataset, ctx: VizRenderContext): VizChartProps;
}

export type VizEngineModule = {engine: VizEngine};
