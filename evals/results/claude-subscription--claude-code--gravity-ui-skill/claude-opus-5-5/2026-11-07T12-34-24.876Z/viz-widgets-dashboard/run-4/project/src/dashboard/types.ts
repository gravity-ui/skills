export type MetricData = {
    title: string;
    value: number;
    /** Изменение к прошлому периоду, в процентах. */
    delta: number;
    unit?: 'currency' | 'percent' | 'count';
    /** true — рост показателя хорош (выручка), false — плох (отток). */
    upIsGood: boolean;
    period: string;
};

export type Goal = {
    name: string;
    value: number;
    target: number;
};

export type GoalsData = {
    title: string;
    goals: Goal[];
};

export type OrderStatus = 'paid' | 'pending' | 'cancelled';

export type Order = {
    id: string;
    customer: string;
    amount: number;
    status: OrderStatus;
};

export type OrdersData = {
    title: string;
    orders: Order[];
};

export type NoteData = {
    title: string;
    text: string;
};

export type TitleData = {
    text: string;
    size: 'xl' | 'l' | 'm' | 's' | 'xs';
    showInTOC: boolean;
};

export const WIDGET_TYPE = {
    Title: 'title',
    Metric: 'metric',
    Goals: 'goals',
    Orders: 'orders',
    Note: 'note',
} as const;

export type WidgetType = (typeof WIDGET_TYPE)[keyof typeof WIDGET_TYPE];
