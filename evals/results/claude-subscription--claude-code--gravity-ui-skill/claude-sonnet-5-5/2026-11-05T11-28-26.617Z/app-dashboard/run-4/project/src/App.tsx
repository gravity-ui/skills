import React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import type {MenuItem} from '@gravity-ui/navigation';
import {Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {Flex, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './OrdersTable';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: {id: SectionId; title: string; icon: MenuItem['icon']}[] = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

function Placeholder({title}: {title: string}) {
  return (
    <Flex alignItems="center" justifyContent="center" style={{height: '100%'}}>
      <Text variant="header-1" color="secondary">
        {title}
      </Text>
    </Flex>
  );
}

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [section, setSection] = React.useState<SectionId>('orders');

  const menuItems = SECTIONS.map<MenuItem>(({id, title, icon}) => ({
    id,
    title,
    icon,
    current: id === section,
    onItemClick: () => setSection(id),
  }));

  const renderPage = () => {
    if (section === 'orders') {
      return <OrdersTable />;
    }
    return <Placeholder title={SECTIONS.find((item) => item.id === section)?.title ?? ''} />;
  };

  return (
    <AsideHeader
      logo={{text: 'Админка', icon: ShoppingCart, iconSize: 24, onClick: () => setSection('home')}}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderContent={() => <div style={{height: '100vh', overflow: 'hidden'}}>{renderPage()}</div>}
    />
  );
}
