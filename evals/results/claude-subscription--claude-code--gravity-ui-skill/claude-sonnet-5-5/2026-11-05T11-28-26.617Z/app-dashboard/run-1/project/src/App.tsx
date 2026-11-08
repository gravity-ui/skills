import React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {Flex, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './OrdersTable';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: {id: SectionId; title: string; icon: typeof House}[] = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [section, setSection] = React.useState<SectionId>('orders');

  const menuItems = SECTIONS.map(({id, title, icon}) => ({
    id,
    title,
    icon,
    current: id === section,
    onItemClick: () => setSection(id),
  }));

  const current = SECTIONS.find((s) => s.id === section)!;

  return (
    <div style={{height: '100vh'}}>
      <AsideHeader
        logo={{text: 'Админка', icon: ShoppingCart}}
        compact={compact}
        onChangeCompact={setCompact}
        menuItems={menuItems}
        renderContent={() => (
          <Flex
            direction="column"
            gap={4}
            style={{height: '100vh', padding: 'var(--g-spacing-6)', boxSizing: 'border-box'}}
          >
            <Text variant="header-1" style={{flexShrink: 0}}>
              {current.title}
            </Text>
            {section === 'orders' ? (
              <OrdersTable />
            ) : (
              <Text variant="body-2" color="secondary">
                Раздел «{current.title}» пока пуст.
              </Text>
            )}
          </Flex>
        )}
      />
    </div>
  );
}
