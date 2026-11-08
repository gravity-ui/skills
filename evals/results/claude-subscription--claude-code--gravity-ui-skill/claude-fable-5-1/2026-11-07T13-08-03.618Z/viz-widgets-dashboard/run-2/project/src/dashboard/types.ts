import type {ConfigItem} from '@gravity-ui/dashkit';

/** Типы пользовательских виджетов, зарегистрированных в DashKit. */
export const WidgetType = {
  Stat: 'stat',
  Meter: 'meter',
  Table: 'table',
  Tasks: 'tasks',
  Title: 'title',
  Text: 'text',
} as const;

export type WidgetType = (typeof WidgetType)[keyof typeof WidgetType];

export interface StatData {
  label: string;
  value: string;
  /** Изменение относительно прошлого периода, например «+4,2 %». */
  delta?: string;
  /** Направление изменения; `upIsGood` решает, какой цвет считать позитивным. */
  direction?: 'up' | 'down';
  upIsGood?: boolean;
  period?: string;
}

export interface MeterRow {
  name: string;
  value: number;
  unit?: string;
}

export interface MeterData {
  title: string;
  rows: MeterRow[];
}

export interface OrderRow {
  id: string;
  customer: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
}

export interface TableData {
  title: string;
  rows: OrderRow[];
}

export interface TaskItem {
  id: string;
  text: string;
}

export interface TasksData {
  title: string;
  tasks: TaskItem[];
}

export type WidgetData = ConfigItem['data'];
