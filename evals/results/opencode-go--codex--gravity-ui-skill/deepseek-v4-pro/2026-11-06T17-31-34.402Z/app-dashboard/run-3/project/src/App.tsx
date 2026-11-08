import React from 'react';
import { AsideHeader } from '@gravity-ui/navigation';
import { House, Person, ShoppingCart, Gear } from '@gravity-ui/icons';
import { Text } from '@gravity-ui/uikit';
import { OrdersTable } from './OrdersTable';
import { orders } from './data';

const menuItems = [
  { id: 'home', title: 'Главная', icon: House, current: true },
  { id: 'users', title: 'Пользователи', icon: Person },
  { id: 'orders', title: 'Заказы', icon: ShoppingCart },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

export function App() {
  const [compact, setCompact] = React.useState(false);

  return (
    <AsideHeader
      logo={{ text: 'Админка', href: '/' }}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderContent={() => (
        <main style={{ padding: '0 24px 24px', height: '100%', boxSizing: 'border-box' }}>
          <OrdersTable orders={orders} />
        </main>
      )}
    />
  );
}
