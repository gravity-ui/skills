import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

export type ChartWidgetMode = 'sales' | 'monitoring';

/** Sparse business series: one point per period (day, week, month). */
export type SalesData = {
  series: {
    name: string;
    points: {timestamp: number; value: number}[];
  }[];
  /** Appended to values in the tooltip, e.g. ' ₽'. */
  valueSuffix?: string;
};

/**
 * Dense monitoring series sharing one timeline (thousands of points per series).
 * `values[i]` belongs to `timeline[i]`; `null` marks a missing sample and renders as a gap.
 */
export type MonitoringData = {
  /** Timestamps in milliseconds. */
  timeline: number[];
  series: {
    name: string;
    values: (number | null)[];
  }[];
  /** Appended to values in the tooltip and Y axis title, e.g. 'ms'. */
  unit?: string;
  /** IANA time zone for the X axis and tooltip, e.g. 'Europe/Moscow'. */
  timeZone?: string;
};

export type ChartWidgetData = {
  sales: SalesData;
  monitoring: MonitoringData;
};

/** What the widget hands to <ChartKit>: one shape for both engines. */
export type ChartKitConfig =
  | {type: 'gravity-charts'; data: ChartData}
  | {type: 'yagr'; data: YagrWidgetData};
