import * as React from 'react';
import {AsideHeader, type AsideHeaderItem} from '@gravity-ui/navigation';
import {Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {Flex, Text} from '@gravity-ui/uikit';

import {KpiTiles} from './components/KpiTiles';
import {OrdersTable} from './components/OrdersTable';
import {ORDERS} from './data/orders';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

interface Section {
  id: SectionId;
  title: string;
  icon: typeof House;
}

const SECTIONS: Section[] = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

export function App() {
  const [section, setSection] = React.useState<SectionId>('home');
  const [compact, setCompact] = React.useState(false);

  const current = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

  const menuItems: AsideHeaderItem[] = SECTIONS.map((item) => ({
    id: item.id,
    title: item.title,
    icon: item.icon,
    current: item.id === section,
    onItemClick: () => setSection(item.id),
  }));

  const renderPage = () => {
    if (section === 'home') {
      return (
        <>
          <KpiTiles orders={ORDERS} />
          <OrdersTable orders={ORDERS} />
        </>
      );
    }
    if (section === 'orders') {
      return <OrdersTable orders={ORDERS} />;
    }
    return (
      <Text variant="body-2" color="secondary">
        Раздел «{current.title}» пока не реализован.
      </Text>
    );
  };

  return (
    <AsideHeader
      logo={{text: 'Админка'}}
      menuItems={menuItems}
      compact={compact}
      onChangeCompact={setCompact}
      renderContent={() => (
        <Flex direction="column" gap={5} style={{padding: 'var(--g-spacing-6)', minWidth: 0}}>
          <Text variant="header-1">{current.title}</Text>
          {renderPage()}
        </Flex>
      )}
    />
  );
}
