import type { ReactNode } from 'react';

import { BarChart, Metrics, Notes, StatusFeed, UsersTable } from './dashboardWidgets';

export type WidgetId = 'metrics' | 'chart' | 'status' | 'users' | 'notes';

export type WidgetLayout = {
  id: WidgetId;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WidgetDefinition = {
  id: WidgetId;
  title: string;
  content: ReactNode;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
};

const statusItems = [
  { time: '14:20', text: 'Deploy v2.4.8 passed' },
  { time: '13:55', text: 'Latency returned to normal' },
  { time: '12:02', text: 'New teammate joined the project' },
];

export const widgetDefinitions: Record<WidgetId, Omit<WidgetDefinition, 'id'>> = {
  metrics: {
    title: 'Key metrics',
    content: <Metrics />,
    color: 'var(--g-color-base-brand)',
    defaultWidth: 4,
    defaultHeight: 3,
  },
  chart: {
    title: 'Weekly activity',
    content: <BarChart />,
    color: '#5a83f5',
    defaultWidth: 8,
    defaultHeight: 4,
  },
  status: {
    title: 'Recent activity',
    content: <StatusFeed items={statusItems} />,
    color: '#3db77d',
    defaultWidth: 5,
    defaultHeight: 3,
  },
  users: {
    title: 'Team',
    content: <UsersTable />,
    color: '#d69c00',
    defaultWidth: 7,
    defaultHeight: 4,
  },
  notes: {
    title: 'Quick notes',
    content: <Notes />,
    color: '#a066f2',
    defaultWidth: 4,
    defaultHeight: 4,
  },
};

export const defaultLayouts: WidgetLayout[] = [
  { id: 'metrics', x: 0, y: 0, width: 4, height: 3 },
  { id: 'chart', x: 4, y: 0, width: 8, height: 4 },
  { id: 'status', x: 0, y: 4, width: 5, height: 3 },
  { id: 'users', x: 5, y: 4, width: 7, height: 4 },
];
