import * as React from 'react';

import {AsideHeader} from '@gravity-ui/navigation';
import type {AsideHeaderItem} from '@gravity-ui/navigation';
import {Cube, Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';

import {HomePage} from './pages/HomePage';
import {OrdersPage} from './pages/OrdersPage';
import {SettingsPage} from './pages/SettingsPage';
import {UsersPage} from './pages/UsersPage';

import './App.css';

type PageId = 'home' | 'users' | 'orders' | 'settings';

const NAV_ITEMS: Array<{id: PageId; title: string; icon: AsideHeaderItem['icon']}> = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [page, setPage] = React.useState<PageId>('orders');

  const menuItems = React.useMemo<AsideHeaderItem[]>(
    () =>
      NAV_ITEMS.map((item) => ({
        id: item.id,
        title: item.title,
        icon: item.icon,
        current: page === item.id,
        onItemClick: () => setPage(item.id),
      })),
    [page],
  );

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage compact={compact} onChangeCompact={setCompact} />;
      case 'orders':
      default:
        return <OrdersPage />;
    }
  };

  return (
    <AsideHeader
      logo={{text: 'Админка', icon: Cube, onClick: () => setPage('home')}}
      headerDecoration
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      expandTitle="Развернуть"
      collapseTitle="Свернуть"
      renderContent={() => <main className="app-content">{renderPage()}</main>}
    />
  );
}
