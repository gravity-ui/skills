import {Text} from '@gravity-ui/uikit';

import {OrdersTable} from '../OrdersTable';

export function OrdersPage() {
  return (
    <div className="page page_fill">
      <div className="page__header">
        <Text variant="header-1">Заказы</Text>
        <Text variant="body-1" color="secondary">
          Выделяйте строки, перетаскивайте заголовки колонок и группируйте заказы по статусу.
        </Text>
      </div>
      <OrdersTable />
    </div>
  );
}
