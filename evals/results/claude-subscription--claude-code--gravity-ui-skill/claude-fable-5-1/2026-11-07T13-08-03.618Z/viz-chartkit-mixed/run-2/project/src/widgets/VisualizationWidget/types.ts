/**
 * Единый API виджета визуализации.
 *
 * Потребитель всегда передаёт данные в одном формате (`VisualizationWidgetData`),
 * а виджет сам маппит их на нужный движок:
 *  - `sales`      → `@gravity-ui/charts` (плагин ChartKit `gravity-charts`) — обычный линейный график;
 *  - `monitoring` → `@gravity-ui/yagr`   (плагин ChartKit `yagr`)           — плотный временной ряд.
 *
 * Оба движка загружаются лениво самим ChartKit (`React.lazy` внутри плагинов).
 */

export type VisualizationMode = 'sales' | 'monitoring';

export interface VisualizationSeries {
    /** Стабильный идентификатор серии (используется в легенде и тултипе). */
    id: string;
    /** Отображаемое имя серии. */
    name: string;
    /** Значения по оси Y. Длина массива должна совпадать с `VisualizationWidgetData.timestamps`. */
    values: Array<number | null>;
    /** Цвет серии. Если не указан — берётся из палитры движка. */
    color?: string;
}

export interface VisualizationWidgetData {
    /** Метки времени (мс, Unix epoch), общая ось X для всех серий. */
    timestamps: number[];
    series: VisualizationSeries[];
    /** Подпись оси Y (например, «₽» или «req/s»). */
    valueLabel?: string;
    /** Единицы измерения, добавляются к значениям в тултипе. */
    unit?: string;
    /** Таймзона для оси X и тултипа (например, `Europe/Moscow`). */
    timeZone?: string;
}

export interface VisualizationWidgetProps {
    /** Заголовок виджета. */
    title: string;
    /** Текущий режим. Если не передан, виджет управляет режимом сам (uncontrolled). */
    mode?: VisualizationMode;
    /** Режим по умолчанию для uncontrolled-варианта. */
    defaultMode?: VisualizationMode;
    /** Колбэк смены режима. */
    onModeChange?: (mode: VisualizationMode) => void;
    /** Данные для режима «продажи». */
    salesData: VisualizationWidgetData;
    /** Данные для режима «мониторинг». */
    monitoringData: VisualizationWidgetData;
    /** Высота области графика в пикселях. */
    height?: number;
    className?: string;
}
