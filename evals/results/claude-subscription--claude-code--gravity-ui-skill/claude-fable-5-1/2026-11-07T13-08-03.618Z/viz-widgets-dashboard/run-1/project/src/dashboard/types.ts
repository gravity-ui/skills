import type {Config} from '@gravity-ui/dashkit';

export type ProgressTheme = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'misc';
export type LabelTheme = 'normal' | 'info' | 'danger' | 'warning' | 'success' | 'utility' | 'unknown';

export interface MetricWidgetData {
    title: string;
    value: string;
    unit?: string;
    /** Изменение к предыдущему периоду в процентах. */
    delta?: number;
    caption?: string;
}

export interface ProgressWidgetData {
    title: string;
    items: Array<{label: string; value: number; theme?: ProgressTheme}>;
}

export interface TableRow {
    service: string;
    status: 'ok' | 'degraded' | 'down';
    latency: number;
    errors: number;
}

export interface TableWidgetData {
    title: string;
    rows: TableRow[];
}

export interface ListWidgetData {
    title: string;
    items: Array<{text: string; time: string; theme?: LabelTheme}>;
}

export const WidgetType = {
    Title: 'title',
    Text: 'text',
    Metric: 'metric',
    Progress: 'progress',
    Table: 'table',
    List: 'list',
} as const;

export type WidgetTypeValue = (typeof WidgetType)[keyof typeof WidgetType];

export type DashboardConfig = Config;
