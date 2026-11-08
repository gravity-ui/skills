import React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import type {MenuItem} from '@gravity-ui/navigation';
import {Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {Flex, Text, sp} from '@gravity-ui/uikit';

import {OrdersTable} from './orders/OrdersTable';

type PageId = 'home' | 'users' | 'orders' | 'settings';

const PAGES: Array<{id: PageId; title: string; icon: MenuItem['icon']}> = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

function PageFrame({title, children}: React.PropsWithChildren<{title: string}>) {
  return (
    <Flex
      direction="column"
      gap={4}
      className={sp({p: 6})}
      style={{height: '100vh', minHeight: 0, boxSizing: 'border-box'}}
    >
      <Text variant="header-1" style={{flexShrink: 0}}>
        {title}
      </Text>
      {children}
    </Flex>
  );
}

function PlaceholderPage({title, description}: {title: string; description: string}) {
  return (
    <PageFrame title={title}>
      <Text variant="body-2" color="secondary">
        {description}
      </Text>
    </PageFrame>
  );
}

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [page, setPage] = React.useState<PageId>('home');

  const menuItems = React.useMemo<MenuItem[]>(
    () =>
      PAGES.map((item) => ({
        id: item.id,
        title: item.title,
        icon: item.icon,
        current: item.id === page,
        onItemClick: () => setPage(item.id),
      })),
    [page],
  );

  const renderContent = React.useCallback(() => {
    switch (page) {
      case 'home':
        return (
          <PageFrame title="Главная">
            <OrdersTable />
          </PageFrame>
        );
      case 'orders':
        return (
          <PageFrame title="Заказы">
            <OrdersTable />
          </PageFrame>
        );
      case 'users':
        return <PlaceholderPage title="Пользователи" description="Раздел в разработке." />;
      case 'settings':
        return <PlaceholderPage title="Настройки" description="Раздел в разработке." />;
      default:
        return null;
    }
  }, [page]);

  return (
    <AsideHeader
      logo={{text: 'Админка', icon: House, onClick: () => setPage('home')}}
      headerDecoration
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderContent={renderContent}
    />
  );
}
