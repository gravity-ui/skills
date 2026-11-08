import { useMemo } from 'react';
import { Text } from '@gravity-ui/uikit';
import { OrdersTable } from '../components/OrdersTable';
import { formatCompact, type Order } from '../data/orders';

interface HomePageProps {
  orders: Order[];
}

interface OrderStats {
  total: number;
  cancelled: number;
  newCount: number;
  inWork: number;
  delivered: number;
  revenue: number;
}

function computeStats(orders: readonly Order[]): OrderStats {
  const stats: OrderStats = {
    total: orders.length,
    cancelled: 0,
    newCount: 0,
    inWork: 0,
    delivered: 0,
    revenue: 0,
  };
  for (const order of orders) {
    if (order.status === 'cancelled') {
      stats.cancelled += 1;
      continue;
    }
    stats.revenue += order.amount;
    if (order.status === 'new') stats.newCount += 1;
    if (order.status === 'new' || order.status === 'processing') stats.inWork += 1;
    if (order.status === 'delivered') stats.delivered += 1;
  }
  return stats;
}

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="stat-tile">
      <Text variant="body-2" color="secondary">
        {label}
      </Text>
      <Text variant="header-2">{value}</Text>
      {note && (
        <Text variant="caption-2" color="secondary">
          {note}
        </Text>
      )}
    </div>
  );
}

export function HomePage({ orders }: HomePageProps) {
  const stats = useMemo(() => computeStats(orders), [orders]);
  const deliveredShare = stats.total === 0 ? 0 : Math.round((stats.delivered / stats.total) * 100);

  return (
    <>
      <h1 className="page-title">Главная</h1>
      <section className="stat-row" aria-label="Ключевые показатели">
        <StatTile label="Заказов" value={String(stats.total)} note={`${stats.cancelled} отменено`} />
        <StatTile
          label="Выручка"
          value={`${formatCompact(stats.revenue)} ₽`}
          note="без отменённых"
        />
        <StatTile label="В работе" value={String(stats.inWork)} note={`${stats.newCount} новых`} />
        <StatTile
          label="Доставлено"
          value={String(stats.delivered)}
          note={`${deliveredShare}% от всех заказов`}
        />
      </section>
      <OrdersTable orders={orders} />
    </>
  );
}
