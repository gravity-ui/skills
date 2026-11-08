import { OrdersTable } from '../components/OrdersTable';
import type { Order } from '../data/orders';

export function OrdersPage({ orders }: { orders: Order[] }) {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Заказы</h1>
        <p className="page__subtitle">Всего {orders.length} заказов за последние 60 дней</p>
      </header>
      <div className="page__fill">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
