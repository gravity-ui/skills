// Shapes of `ConfigItem.data` for every widget type registered in DashKit.

export const WidgetType = {
    Title: 'title',
    Metric: 'metric',
    Goals: 'goals',
    Events: 'events',
    Note: 'note',
} as const;

export type WidgetTypeValue = (typeof WidgetType)[keyof typeof WidgetType];

/** Data of the built-in `pluginTitle`. */
export interface TitleData {
    text: string;
    size: 'xl' | 'l' | 'm' | 's' | 'xs';
    showInTOC: boolean;
}

export interface MetricData {
    title: string;
    value: string;
    /** Change vs. previous period, in percent. */
    delta: number;
    /** `true` when growth is bad (e.g. churn). */
    inverted?: boolean;
}

export interface GoalsData {
    title: string;
    goals: {name: string; progress: number}[];
}

export type EventStatus = 'success' | 'warning' | 'danger' | 'info';

export interface EventsData {
    title: string;
    events: {text: string; time: string; status: EventStatus}[];
}

export interface NoteData {
    title: string;
    text: string;
}
