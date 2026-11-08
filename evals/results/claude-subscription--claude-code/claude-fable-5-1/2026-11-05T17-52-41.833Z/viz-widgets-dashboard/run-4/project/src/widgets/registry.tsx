import type { ComponentType } from 'react';

import { EventsWidget } from './EventsWidget';
import { OrdersWidget } from './OrdersWidget';
import { QuotasWidget } from './QuotasWidget';
import { SourcesWidget } from './SourcesWidget';
import { StatTileWidget } from './StatTileWidget';
import { TrafficWidget } from './TrafficWidget';
import type { WidgetProps } from './types';

export type WidgetType = 'revenue' | 'users' | 'traffic' | 'orders' | 'events' | 'quotas' | 'sources';

export interface WidgetDefinition {
  type: WidgetType;
  title: string;
  description: string;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  component: ComponentType<WidgetProps>;
}

export const WIDGETS: Record<WidgetType, WidgetDefinition> = {
  revenue: {
    type: 'revenue',
    title: 'Выручка',
    description: 'Ключевой показатель с динамикой',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    component: (props) => <StatTileWidget {...props} metric="revenue" />,
  },
  users: {
    type: 'users',
    title: 'Пользователи',
    description: 'Активные пользователи в день',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    component: (props) => <StatTileWidget {...props} metric="users" />,
  },
  traffic: {
    type: 'traffic',
    title: 'Трафик по дням',
    description: 'Линейный график: веб и мобильное приложение',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    component: TrafficWidget,
  },
  orders: {
    type: 'orders',
    title: 'Заказы по регионам',
    description: 'Столбчатая диаграмма',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 3, h: 3 },
    component: OrdersWidget,
  },
  events: {
    type: 'events',
    title: 'Журнал событий',
    description: 'Таблица последних уведомлений',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 2 },
    component: EventsWidget,
  },
  quotas: {
    type: 'quotas',
    title: 'Квоты',
    description: 'Использование ресурсов',
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
    component: QuotasWidget,
  },
  sources: {
    type: 'sources',
    title: 'Источники трафика',
    description: 'Доли каналов привлечения',
    defaultSize: { w: 6, h: 2 },
    minSize: { w: 3, h: 2 },
    component: SourcesWidget,
  },
};

export const WIDGET_LIST = Object.values(WIDGETS);
export const isWidgetType = (t: unknown): t is WidgetType => typeof t === 'string' && t in WIDGETS;
