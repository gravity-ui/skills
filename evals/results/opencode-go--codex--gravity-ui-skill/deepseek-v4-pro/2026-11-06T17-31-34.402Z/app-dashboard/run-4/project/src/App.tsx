import React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {House, Person, Receipt, Gear} from '@gravity-ui/icons';
import {Text, sp} from '@gravity-ui/uikit';
import {OrdersTable} from './OrdersTable';

export function App() {
  const [compact, setCompact] = React.useState(false);

  return (
    <AsideHeader
      logo={{text: 'Админка', href: '/'}}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={[
        {id: 'home', title: 'Главная', icon: House, current: false},
        {id: 'users', title: 'Пользователи', icon: Person},
        {id: 'orders', title: 'Заказы', icon: Receipt, current: true},
        {id: 'settings', title: 'Настройки', icon: Gear},
      ]}
      renderContent={() => (
        <main className={sp({p: 6})}>
          <Text variant="header-1" className={sp({mb: 4})}>
            Заказы
          </Text>
          <OrdersTable />
        </main>
      )}
    />
  );
}
