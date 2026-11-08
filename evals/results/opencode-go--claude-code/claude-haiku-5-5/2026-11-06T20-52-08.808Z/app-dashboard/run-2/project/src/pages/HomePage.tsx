import { useMemo } from 'react';
import { Icon, Label, Text } from '@gravity-ui/uikit';
import { ORDER_STATUSES, type Order } from '../orders/types';
import { STATUS_META, formatMoney } from '../orders/presentation';

interface HomePageProps {
  orders: Order[];
}

export function HomePage({ orders }: HomePageProps) {
  const stats = useMemo(() => {
    // Cancelled orders don't count as revenue or toward the average check.
    const paid = orders.filter((o) => o.status !== 'cancelled');
    const revenue = paid.reduce((sum, o) => sum + o.total, 0);
    const active = orders.filter((o) => o.status === 'new' || o.status === 'processing' || o.status === 'shipped').length;
    const countByStatus = ORDER_STATUSES.map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    }));
    return {
      totalOrders: orders.length,
      revenue,
      active,
      averageCheck: paid.length > 0 ? Math.round(revenue / paid.length) : 0,
      countByStatus,
    };
  }, [orders]);

  const tiles = [
    { label: 'Заказов всего', value: stats.totalOrders.toLocaleString('ru-RU') },
    { label: 'Выручка без отменённых', value: formatMoney(stats.revenue) },
    { label: 'В работе', value: stats.active.toLocaleString('ru-RU') },
    { label: 'Средний чек', value: formatMoney(stats.averageCheck) },
  ];

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <Text variant="header-2">Главная</Text>
          <Text variant="body-1" color="secondary" className="page-subtitle">
            Сводка по заказам
          </Text>
        </div>
      </header>

      <div className="stat-grid">
        {tiles.map((tile) => (
          <div key={tile.label} className="stat-tile">
            <Text variant="caption-2" color="secondary">
              {tile.label}
            </Text>
            <Text variant="display-1">{tile.value}</Text>
          </div>
        ))}
      </div>

      <div className="status-summary">
        <Text variant="subheader-2">По статусам</Text>
        <ul className="status-list">
          {stats.countByStatus.map(({ status, count }) => (
            <li key={status} className="status-list-item">
              <Label theme={STATUS_META[status].theme} size="s" icon={<Icon data={STATUS_META[status].icon} size={12} />}>
                {STATUS_META[status].label}
              </Label>
              <span className="tabular">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
