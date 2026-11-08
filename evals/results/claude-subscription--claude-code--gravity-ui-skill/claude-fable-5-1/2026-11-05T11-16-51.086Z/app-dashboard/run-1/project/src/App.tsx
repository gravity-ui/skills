import React from 'react';
import { AsideHeader } from '@gravity-ui/navigation';
import type { MenuItem } from '@gravity-ui/navigation';
import { Card, Flex, Text } from '@gravity-ui/uikit';
import { Cube, Gear, House, Persons, ShoppingCart } from '@gravity-ui/icons';

import { OrdersTable } from './components/OrdersTable';
import { generateOrders } from './data/orders';

import './App.css';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: { id: SectionId; title: string; icon: MenuItem['icon'] }[] = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'users', title: 'Пользователи', icon: Persons },
  { id: 'orders', title: 'Заказы', icon: ShoppingCart },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

const ORDERS = generateOrders(120);

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Flex direction="column" gap={1} className="page__header">
      <Text variant="header-1">{title}</Text>
      {subtitle ? (
        <Text variant="body-1" color="secondary">
          {subtitle}
        </Text>
      ) : null}
    </Flex>
  );
}

function Placeholder({ title, description }: { title: string; description: string }) {
  return (
    <Card view="outlined" className="page__placeholder">
      <Flex direction="column" alignItems="center" gap={1}>
        <Text variant="subheader-2">{title}</Text>
        <Text variant="body-1" color="secondary">
          {description}
        </Text>
      </Flex>
    </Card>
  );
}

function SectionContent({ section }: { section: SectionId }) {
  switch (section) {
    case 'home':
      return (
        <>
          <PageHeader title="Главная" subtitle="Сводка по заказам за последние два месяца" />
          <OrdersTable orders={ORDERS} />
        </>
      );
    case 'orders':
      return (
        <>
          <PageHeader title="Заказы" subtitle="Все заказы магазина" />
          <OrdersTable orders={ORDERS} />
        </>
      );
    case 'users':
      return (
        <>
          <PageHeader title="Пользователи" />
          <Placeholder title="Раздел в разработке" description="Здесь появится список пользователей и их роли." />
        </>
      );
    case 'settings':
      return (
        <>
          <PageHeader title="Настройки" />
          <Placeholder title="Раздел в разработке" description="Здесь появятся параметры магазина и интеграции." />
        </>
      );
  }
}

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [section, setSection] = React.useState<SectionId>('home');

  const menuItems = React.useMemo<MenuItem[]>(
    () =>
      SECTIONS.map((item) => ({
        id: item.id,
        title: item.title,
        icon: item.icon,
        current: item.id === section,
        onItemClick: () => setSection(item.id),
      })),
    [section],
  );

  return (
    <AsideHeader
      className="app-shell"
      logo={{ text: 'Админка', icon: Cube, onClick: () => setSection('home') }}
      headerDecoration
      compact={compact}
      onChangeCompact={setCompact}
      collapseTitle="Свернуть"
      expandTitle="Развернуть"
      menuItems={menuItems}
      renderContent={() => (
        <main className="page">
          <SectionContent section={section} />
        </main>
      )}
    />
  );
}
