import React from 'react';
import { AsideHeader } from '@gravity-ui/navigation';
import type { MenuItem } from '@gravity-ui/navigation';
import { Gear, House, LayoutSideContent, Persons, ShoppingCart } from '@gravity-ui/icons';
import type { IconData } from '@gravity-ui/uikit';
import { Flex, Icon, Text } from '@gravity-ui/uikit';

import { OrdersTable } from './orders/OrdersTable';

import './App.css';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: { id: SectionId; title: string; icon: IconData }[] = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'users', title: 'Пользователи', icon: Persons },
  { id: 'orders', title: 'Заказы', icon: ShoppingCart },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

const COMPACT_STORAGE_KEY = 'admin:aside-compact';

function SectionPlaceholder({ title, icon }: { title: string; icon: IconData }) {
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" gap={3} className="app__placeholder">
      <Icon data={icon} size={40} />
      <Text variant="subheader-2">{title}</Text>
      <Text color="secondary">Раздел в разработке</Text>
    </Flex>
  );
}

export function App() {
  const [section, setSection] = React.useState<SectionId>('orders');
  const [compact, setCompact] = React.useState(() => localStorage.getItem(COMPACT_STORAGE_KEY) === '1');

  const handleChangeCompact = React.useCallback((value: boolean) => {
    setCompact(value);
    localStorage.setItem(COMPACT_STORAGE_KEY, value ? '1' : '0');
  }, []);

  const menuItems = React.useMemo<MenuItem[]>(
    () =>
      SECTIONS.map(({ id, title, icon }) => ({
        id,
        title,
        icon,
        current: id === section,
        onItemClick: () => setSection(id),
      })),
    [section],
  );

  const current = SECTIONS.find((s) => s.id === section)!;

  return (
    <AsideHeader
      logo={{ text: 'Админка', icon: LayoutSideContent, iconSize: 24, onClick: () => setSection('home') }}
      compact={compact}
      onChangeCompact={handleChangeCompact}
      collapseTitle="Свернуть меню"
      expandTitle="Развернуть меню"
      menuItems={menuItems}
      headerDecoration
      renderContent={() => (
        <main className="app__content">
          <Text as="h1" variant="header-1" className="app__title">
            {current.title}
          </Text>
          {section === 'orders' ? (
            <OrdersTable />
          ) : (
            <SectionPlaceholder title={current.title} icon={current.icon} />
          )}
        </main>
      )}
    />
  );
}
