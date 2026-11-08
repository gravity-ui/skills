import { useMemo } from 'react';
import { Card, Icon } from '@gravity-ui/uikit';
import { ArrowDown, ArrowUp, Minus } from '@gravity-ui/icons';
import { OrdersTable } from '../components/OrdersTable';
import { computeKpis } from '../data/kpi';
import type { Kpi } from '../data/kpi';
import { REFERENCE_NOW } from '../data/orders';
import type { Order } from '../data/orders';

function KpiTile({ kpi }: { kpi: Kpi }) {
  const delta = kpi.delta;
  const icon = delta?.direction === 'up' ? ArrowUp : delta?.direction === 'down' ? ArrowDown : Minus;

  return (
    <Card view="outlined" size="l" className="kpi">
      <div className="kpi__label">{kpi.label}</div>
      <div className="kpi__value">{kpi.value}</div>
      {delta ? (
        <div className={`kpi__delta kpi__delta--${delta.tone}`}>
          <Icon data={icon} size={14} />
          <span>{delta.text}</span>
          <span className="kpi__hint">к предыдущим 30 дням</span>
        </div>
      ) : (
        <div className="kpi__delta kpi__delta--neutral">
          <span className="kpi__hint">Нет данных за прошлый период</span>
        </div>
      )}
    </Card>
  );
}

export function DashboardPage({ orders }: { orders: Order[] }) {
  const kpis = useMemo(() => computeKpis(orders, REFERENCE_NOW), [orders]);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Главная</h1>
        <p className="page__subtitle">Сводка за последние 30 дней</p>
      </header>

      <section className="kpi-row" aria-label="Ключевые показатели">
        {kpis.map((kpi) => (
          <KpiTile key={kpi.id} kpi={kpi} />
        ))}
      </section>

      <section className="page__section">
        <h2 className="page__section-title">Заказы</h2>
        <OrdersTable orders={orders} />
      </section>
    </div>
  );
}
