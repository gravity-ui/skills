import * as React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import type {AsideHeaderItem} from '@gravity-ui/navigation';
import {Gear, House, Persons, Receipt} from '@gravity-ui/icons';
import {Box, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './components/OrdersTable';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTION_TITLES: Record<SectionId, string> = {
  home: 'Главная',
  users: 'Пользователи',
  orders: 'Заказы',
  settings: 'Настройки',
};

function SectionContent({section}: {section: SectionId}) {
  // Главная и «Заказы» показывают таблицу заказов; остальные разделы пока пустые.
  const hasOrders = section === 'home' || section === 'orders';

  return (
    <Box spacing={{p: 6}}>
      <Box spacing={{mb: 4}}>
        <Text variant="header-1">{SECTION_TITLES[section]}</Text>
      </Box>
      {hasOrders ? (
        <OrdersTable />
      ) : (
        <Text variant="body-1" color="secondary">
          Раздел в разработке
        </Text>
      )}
    </Box>
  );
}

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [section, setSection] = React.useState<SectionId>('home');

  const menuItems: AsideHeaderItem[] = [
    {
      id: 'home',
      title: SECTION_TITLES.home,
      icon: House,
      current: section === 'home',
      onItemClick: () => setSection('home'),
    },
    {
      id: 'users',
      title: SECTION_TITLES.users,
      icon: Persons,
      current: section === 'users',
      onItemClick: () => setSection('users'),
    },
    {
      id: 'orders',
      title: SECTION_TITLES.orders,
      icon: Receipt,
      current: section === 'orders',
      onItemClick: () => setSection('orders'),
    },
    {
      id: 'settings',
      title: SECTION_TITLES.settings,
      icon: Gear,
      current: section === 'settings',
      onItemClick: () => setSection('settings'),
    },
  ];

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
