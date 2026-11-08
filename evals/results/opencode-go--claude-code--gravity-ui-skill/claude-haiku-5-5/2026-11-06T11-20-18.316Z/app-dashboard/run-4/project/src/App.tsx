import React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import type {AsideHeaderItem} from '@gravity-ui/navigation';
import {Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {Flex, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './components/OrdersTable';
import {ORDERS} from './data/orders';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: {id: SectionId; title: string; icon: AsideHeaderItem['icon']}[] = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

function PageHeading({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Flex direction="column" gap={5} style={{padding: 24, minWidth: 0}}>
      <Text variant="header-1">{title}</Text>
      {children}
    </Flex>
  );
}

function SectionContent({section}: {section: SectionId}) {
  switch (section) {
    case 'home':
      return (
        <PageHeading title="Главная">
          <OrdersTable orders={ORDERS} />
        </PageHeading>
      );
    case 'orders':
      return (
        <PageHeading title="Заказы">
          <OrdersTable orders={ORDERS} />
        </PageHeading>
      );
    case 'users':
      return (
        <PageHeading title="Пользователи">
          <Text variant="body-1" color="secondary">
            Раздел в разработке
          </Text>
        </PageHeading>
      );
    case 'settings':
      return (
        <PageHeading title="Настройки">
          <Text variant="body-1" color="secondary">
            Раздел в разработке
          </Text>
        </PageHeading>
      );
  }
}

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [section, setSection] = React.useState<SectionId>('home');

  const menuItems: AsideHeaderItem[] = SECTIONS.map((item) => ({
    id: item.id,
    title: item.title,
    icon: item.icon,
    current: item.id === section,
    onItemClick: () => setSection(item.id),
  }));

  return (
    <AsideHeader
      logo={{text: 'Админка'}}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderContent={() => <SectionContent section={section} />}
    />
  );
}
