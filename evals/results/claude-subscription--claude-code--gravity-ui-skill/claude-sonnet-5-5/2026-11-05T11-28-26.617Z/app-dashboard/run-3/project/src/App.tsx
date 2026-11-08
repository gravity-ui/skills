import React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import type {MenuItem} from '@gravity-ui/navigation';
import {Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';

import {OrdersTable} from './OrdersTable';

const NAV_ITEMS = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [current, setCurrent] = React.useState('orders');

  const menuItems: MenuItem[] = NAV_ITEMS.map((item) => ({
    ...item,
    current: item.id === current,
    onItemClick: () => setCurrent(item.id),
  }));

  return (
    <AsideHeader
      logo={{text: 'Админка', icon: ShoppingCart, iconSize: 24}}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderContent={() => (
        <div style={{height: '100vh', boxSizing: 'border-box', padding: 'var(--g-spacing-6)'}}>
          {current === 'orders' ? <OrdersTable /> : null}
        </div>
      )}
    />
  );
}
