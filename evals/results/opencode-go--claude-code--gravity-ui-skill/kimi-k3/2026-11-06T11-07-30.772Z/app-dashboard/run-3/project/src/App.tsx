import React from 'react';

import {AsideHeader, type MenuItem} from '@gravity-ui/navigation';
import {configure, Flex, Text} from '@gravity-ui/uikit';
import {Boxes3, Gear, House, Persons, Receipt} from '@gravity-ui/icons';

import {OrdersTable} from './components/OrdersTable';

import './App.css';

configure({lang: 'ru'});

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTION_TITLES: Record<SectionId, string> = {
  home: 'Главная',
  users: 'Пользователи',
  orders: 'Заказы',
  settings: 'Настройки',
};

const SECTION_HINTS: Record<Exclude<SectionId, 'orders'>, string> = {
  home: 'Сводка по ключевым метрикам магазина появится здесь.',
  users: 'Управление учётными записями и ролями появится здесь.',
  settings: 'Параметры приложения и интеграций появятся здесь.',
};

const SECTION_ICONS: Record<SectionId, MenuItem['icon']> = {
  home: House,
  users: Persons,
  orders: Receipt,
  settings: Gear,
};

const SECTION_ORDER: SectionId[] = ['home', 'users', 'orders', 'settings'];

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [section, setSection] = React.useState<SectionId>('orders');

  const menuItems = React.useMemo<MenuItem[]>(
    () =>
      SECTION_ORDER.map((id) => ({
        id,
        title: SECTION_TITLES[id],
        tooltipText: SECTION_TITLES[id],
        icon: SECTION_ICONS[id],
        current: section === id,
        onItemClick: () => setSection(id),
      })),
    [section],
  );

  return (
    <div className="app">
      <AsideHeader
        logo={{text: 'Админка', icon: Boxes3}}
        compact={compact}
        onChangeCompact={setCompact}
        menuItems={menuItems}
        headerDecoration
        collapseTitle="Свернуть меню"
        expandTitle="Развернуть меню"
        renderContent={() => (
          <main className="page">
            {section === 'orders' ? (
              <Flex direction="column" gap={4} className="page__inner">
                <Text variant="header-1">Заказы</Text>
                <OrdersTable />
              </Flex>
            ) : (
              <Flex direction="column" gap={2} className="page__inner">
                <Text variant="header-1">{SECTION_TITLES[section]}</Text>
                <Text variant="body-1" color="secondary">
                  {SECTION_HINTS[section]}
                </Text>
              </Flex>
            )}
          </main>
        )}
      />
    </div>
  );
}
