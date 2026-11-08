import React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {Text} from '@gravity-ui/uikit';

import {OrdersTable} from './OrdersTable';

import './App.css';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: Array<{id: SectionId; title: string; icon: typeof House}> = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

function Page({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div className="app__page">
      <Text as="h1" variant="header-1" className="app__page-header">
        {title}
      </Text>
      {children}
    </div>
  );
}

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [section, setSection] = React.useState<SectionId>('orders');

  const menuItems = SECTIONS.map((item) => ({
    id: item.id,
    title: item.title,
    icon: item.icon,
    current: item.id === section,
    onItemClick: () => setSection(item.id),
  }));

  const renderContent = () => {
    switch (section) {
      case 'orders':
        return (
          <Page title="Заказы">
            <OrdersTable />
          </Page>
        );
      case 'home':
        return (
          <Page title="Главная">
            <Text variant="body-1" className="app__placeholder">Сводка по магазину появится здесь.</Text>
          </Page>
        );
      case 'users':
        return (
          <Page title="Пользователи">
            <Text variant="body-1" className="app__placeholder">Список пользователей появится здесь.</Text>
          </Page>
        );
      case 'settings':
        return (
          <Page title="Настройки">
            <Text variant="body-1" className="app__placeholder">Настройки магазина появятся здесь.</Text>
          </Page>
        );
    }
  };

  return (
    <div className="app">
      <AsideHeader
        logo={{text: 'Админка', icon: ShoppingCart, onClick: () => setSection('home')}}
        headerDecoration
        compact={compact}
        onChangeCompact={setCompact}
        collapseTitle="Свернуть"
        expandTitle="Развернуть"
        menuItems={menuItems}
        renderContent={renderContent}
      />
    </div>
  );
}
