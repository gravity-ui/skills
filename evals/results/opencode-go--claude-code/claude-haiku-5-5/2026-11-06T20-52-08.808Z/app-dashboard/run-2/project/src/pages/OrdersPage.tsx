import { useMemo, useState } from 'react';
import { Button, Switch, Text } from '@gravity-ui/uikit';
import { OrdersTable } from '../components/OrdersTable';
import type { Order } from '../orders/types';

interface OrdersPageProps {
  orders: Order[];
}

export function OrdersPage({ orders }: OrdersPageProps) {
  const [grouped, setGrouped] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  // Only count selected ids that still exist in the data.
  const selectedCount = useMemo(
    () => orders.reduce((count, order) => count + (selectedIds.has(order.id) ? 1 : 0), 0),
    [orders, selectedIds],
  );

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <Text variant="header-2">Заказы</Text>
          <Text variant="body-1" color="secondary" className="page-subtitle">
            Всего: {orders.length}
          </Text>
        </div>
        <Switch checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
      </header>

      <div className="table-toolbar" role="status" aria-live="polite">
        {selectedCount > 0 ? (
          <>
            <Text variant="body-2">Выбрано: {selectedCount}</Text>
            <Button view="flat" size="s" onClick={() => setSelectedIds(new Set())}>
              Снять выделение
            </Button>
          </>
        ) : (
          <Text variant="body-2" color="secondary">
            Клик по строке переключает её выделение, Shift + клик выделяет диапазон. Колонки можно перетаскивать.
          </Text>
        )}
      </div>

      <OrdersTable
        orders={orders}
        grouped={grouped}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />
    </section>
  );
}
