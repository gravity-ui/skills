/**
 * Публичный контракт единого виджета визуализации.
 *
 * Один и тот же компонент `VizWidget` работает в двух режимах:
 *  - `sales`      — обычный линейный график продаж (движок @gravity-ui/charts);
 *  - `monitoring` — плотный временной ряд мониторинга (движок @gravity-ui/yagr).
 *
 * Потребитель передаёт данные в едином (engine-agnostic) формате,
 * преобразование в формат конкретного движка делают адаптеры из `./adapters`.
 */

export type VizWidgetMode = 'sales' | 'monitoring';

/** Одна точка продаж: метка времени (мс с Unix epoch) + значение. */
export interface SalesPoint {
  /** Timestamp в миллисекундах. */
  date: number;
  value: number;
}

/** Именованная линия продаж (например, товарная категория). */
export interface SalesSeries {
  name: string;
  points: SalesPoint[];
}

/** Входные данные режима `sales`. */
export interface SalesData {
  series: SalesSeries[];
  /** Подпись оси значений, например «Выручка, млн ₽». */
  valueAxisTitle?: string;
}

/** Именованный ряд мониторинга. */
export interface MonitoringSeries {
  name: string;
  /** Значения, выровненные по `timeline` общего входа; `null` — пропуск. */
  values: (number | null)[];
}

/** Входные данные режима `monitoring` — плотный временной ряд. */
export interface MonitoringData {
  /** Общая ось времени, timestamps в миллисекундах, строго по возрастанию. */
  timeline: number[];
  series: MonitoringSeries[];
  /** Подпись оси значений, например «CPU, %». */
  valueAxisTitle?: string;
  /** IANA-таймзона для оси X и тултипа, например "Europe/Moscow". */
  timeZone?: string;
}

interface VizWidgetBaseProps {
  /** Заголовок виджета. */
  title?: string;
  /** Высота области графика в px (движки требуют явной высоты контейнера). */
  height?: number;
  /** Стабильный id экземпляра (нужен движку yagr); по умолчанию генерируется. */
  id?: string;
}

export type VizWidgetProps = VizWidgetBaseProps &
  (
    | {mode: 'sales'; data: SalesData}
    | {mode: 'monitoring'; data: MonitoringData}
  );
