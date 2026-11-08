import { OrdersTable } from '../components/OrdersTable';
import type { Order } from '../data/orders';

export function OrdersPage({ orders }: { orders: Order[] }) {
  return (
    <>
      <h1 className="page-title">Заказы</h1>
      <OrdersTable orders={orders} />
    </>
  );
}
