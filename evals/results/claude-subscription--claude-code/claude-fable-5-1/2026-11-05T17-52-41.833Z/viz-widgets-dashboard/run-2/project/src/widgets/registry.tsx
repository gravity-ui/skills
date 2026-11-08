import type { ReactNode } from 'react';

import { fmt, type DashboardData } from '../data';
import type { LayoutItem } from '../grid/layout';
import { ChannelsWidget } from './ChannelsWidget';
import { OrdersWidget } from './OrdersWidget';
import { PlansWidget } from './PlansWidget';
import { QuotaWidget } from './QuotaWidget';
import { RevenueWidget } from './RevenueWidget';
import { ServicesWidget } from './ServicesWidget';
import { StatTileWidget } from './StatTileWidget';

export interface WidgetDefinition {
  id: string;
  title: string;
  /** Размер и ограничения по умолчанию (позиция задаётся в DEFAULT_LAYOUT). */
  size: Pick<LayoutItem, 'w' | 'h' | 'minW' | 'minH' | 'maxH'>;
  render: (data: DashboardData, onRemove: () => void) => ReactNode;
}

export const WIDGETS: WidgetDefinition[] = [
  {
    id: 'mrr',
    title: 'MRR',
    size: { w: 3, h: 3, minW: 2, minH: 3, maxH: 4 },
    render: (data, onRemove) => <StatTileWidget title="MRR" hero kpi={data.kpis.mrr} format={fmt.compactRub} onRemove={onRemove} />,
  },
  {
    id: 'users',
    title: 'Активные пользователи',
    size: { w: 3, h: 3, minW: 2, minH: 3, maxH: 4 },
    render: (data, onRemove) => <StatTileWidget title="Активные пользователи" kpi={data.kpis.users} format={fmt.number} onRemove={onRemove} />,
  },
  {
    id: 'conversion',
    title: 'Конверсия в оплату',
    size: { w: 3, h: 3, minW: 2, minH: 3, maxH: 4 },
    render: (data, onRemove) => <StatTileWidget title="Конверсия в оплату" kpi={data.kpis.conversion} format={fmt.percent} onRemove={onRemove} />,
  },
  {
    id: 'churn',
    title: 'Отток',
    size: { w: 3, h: 3, minW: 2, minH: 3, maxH: 4 },
    render: (data, onRemove) => <StatTileWidget title="Отток" kpi={data.kpis.churn} format={fmt.percent} onRemove={onRemove} />,
  },
  {
    id: 'revenue',
    title: 'Выручка',
    size: { w: 8, h: 6, minW: 4, minH: 4 },
    render: (data, onRemove) => <RevenueWidget revenue={data.revenue} weekly={data.range === '90d'} onRemove={onRemove} />,
  },
  {
    id: 'quota',
    title: 'Хранилище',
    size: { w: 4, h: 3, minW: 3, minH: 3, maxH: 4 },
    render: (data, onRemove) => <QuotaWidget quota={data.quota} onRemove={onRemove} />,
  },
  {
    id: 'plans',
    title: 'Тарифы',
    size: { w: 4, h: 3, minW: 3, minH: 3, maxH: 4 },
    render: (data, onRemove) => <PlansWidget plans={data.plans} onRemove={onRemove} />,
  },
  {
    id: 'channels',
    title: 'Регистрации по каналам',
    size: { w: 4, h: 6, minW: 3, minH: 4 },
    render: (data, onRemove) => <ChannelsWidget channels={data.channels} onRemove={onRemove} />,
  },
  {
    id: 'services',
    title: 'Сервисы',
    size: { w: 3, h: 6, minW: 2, minH: 4 },
    render: (data, onRemove) => <ServicesWidget services={data.services} onRemove={onRemove} />,
  },
  {
    id: 'orders',
    title: 'Последние заказы',
    size: { w: 5, h: 6, minW: 4, minH: 4 },
    render: (data, onRemove) => <OrdersWidget orders={data.orders} onRemove={onRemove} />,
  },
];

const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  mrr: { x: 0, y: 0 },
  users: { x: 3, y: 0 },
  conversion: { x: 6, y: 0 },
  churn: { x: 9, y: 0 },
  revenue: { x: 0, y: 3 },
  quota: { x: 8, y: 3 },
  plans: { x: 8, y: 6 },
  channels: { x: 0, y: 9 },
  services: { x: 4, y: 9 },
  orders: { x: 7, y: 9 },
};

export const DEFAULT_LAYOUT: LayoutItem[] = WIDGETS.map((w) => ({ i: w.id, ...DEFAULT_POSITIONS[w.id], ...w.size }));
