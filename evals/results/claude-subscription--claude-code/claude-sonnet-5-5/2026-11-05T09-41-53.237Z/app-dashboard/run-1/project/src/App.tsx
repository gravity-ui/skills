import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {AsideHeader} from '@gravity-ui/navigation';
import type {AsideHeaderItem} from '@gravity-ui/navigation';
import {Box, Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';

import {OrdersTable} from './OrdersTable';
import './App.css';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: {id: SectionId; title: string; icon: AsideHeaderItem['icon']}[] = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

const COMPACT_KEY = 'admin:sidebar-compact';

function Placeholder({title}: {title: string}) {
  return (
    <div className="app__placeholder">
      <Text variant="header-1" as="h1">
        {title}
      </Text>
      <Text variant="body-1" color="secondary">
        Раздел пока пуст
      </Text>
    </div>
  );
}

export function App() {
  const [section, setSection] = React.useState<SectionId>('orders');
  const [compact, setCompact] = React.useState(() => localStorage.getItem(COMPACT_KEY) === '1');

  const handleChangeCompact = React.useCallback((value: boolean) => {
    setCompact(value);
    localStorage.setItem(COMPACT_KEY, value ? '1' : '0');
  }, []);

  const menuItems = React.useMemo<AsideHeaderItem[]>(
    () =>
      SECTIONS.map(({id, title, icon}) => ({
        id,
        title,
        icon,
        current: id === section,
        onItemClick: () => setSection(id),
      })),
    [section],
  );

  return (
    <AsideHeader
      logo={{text: 'Admin', icon: Box, iconSize: 24, onClick: () => setSection('home')}}
      compact={compact}
      onChangeCompact={handleChangeCompact}
      menuItems={menuItems}
      menuOverflow="scroll"
      renderContent={() => (
        <main className="app__content">
          {section === 'orders' ? (
            <OrdersTable />
          ) : (
            <Placeholder title={SECTIONS.find((s) => s.id === section)!.title} />
          )}
        </main>
      )}
    />
  );
}
