import React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {Box, Flex, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './OrdersTable';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: {id: SectionId; title: string; icon: typeof House}[] = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

function SectionContent({section}: {section: SectionId}) {
  const title = SECTIONS.find((item) => item.id === section)?.title ?? '';

  // Главная и «Заказы» показывают таблицу заказов; остальные разделы пока заглушки.
  const showsOrders = section === 'home' || section === 'orders';

  return (
    <Box spacing={{p: 6}}>
      <Flex direction="column" gap={5}>
        <Text variant="header-1">{title}</Text>
        {showsOrders ? (
          <OrdersTable />
        ) : (
          <Text variant="body-1" color="secondary">
            Раздел в разработке
          </Text>
        )}
      </Flex>
    </Box>
  );
}

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [section, setSection] = React.useState<SectionId>('home');

  const menuItems = SECTIONS.map((item) => ({
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
      collapseTitle="Свернуть"
      expandTitle="Развернуть"
      menuMoreTitle="Ещё"
      menuItems={menuItems}
      renderContent={() => <SectionContent section={section} />}
    />
  );
}
