import { useMemo, type ReactNode } from 'react';
import { formatAmount, type Order } from '../orders/model';
import { OrdersTable } from '../orders/OrdersTable';

function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {children}
    </header>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="kpi">
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
    </div>
  );
}

export function HomePage({ orders }: { orders: readonly Order[] }) {
  const stats = useMemo(() => {
    let active = 0;
    let revenue = 0;
    for (const order of orders) {
      if (order.status === 'new' || order.status === 'processing') active += 1;
      if (order.status !== 'cancelled') revenue += order.amount;
    }
    return { total: orders.length, active, revenue };
  }, [orders]);

  return (
    <>
      <PageHeader title="Главная" />
      <div className="kpi-grid">
        <Kpi label="Всего заказов" value={String(stats.total)} />
        <Kpi label="В работе" value={String(stats.active)} />
        <Kpi label="Выручка без отмен" value={formatAmount(stats.revenue)} />
      </div>
      <OrdersTable orders={orders} />
    </>
  );
}

export function OrdersPage({ orders }: { orders: readonly Order[] }) {
  return (
    <>
      <PageHeader title="Заказы" />
      <OrdersTable orders={orders} />
    </>
  );
}

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <p className="page-placeholder">Раздел в разработке.</p>
    </>
  );
}
