import React from 'react';

import {House, Gear, Persons, ShoppingCart} from '@gravity-ui/icons';
import {AsideHeader} from '@gravity-ui/navigation';
import type {MenuItem} from '@gravity-ui/navigation';
import type {RowSelectionState} from '@gravity-ui/table/tanstack';
import {Button, Flex, Switch, Text} from '@gravity-ui/uikit';

import {ORDERS} from './data';
import {OrdersTable} from './OrdersTable';
import './app.css';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: {id: SectionId; title: string; icon: MenuItem['icon']}[] = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

function OrdersPage({title}: {title: string}) {
  const [grouped, setGrouped] = React.useState(true);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const selectedCount = Object.keys(rowSelection).length;

  return (
    <Flex direction="column" gap={4} className="orders-page">
      <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
        <Flex direction="column" gap={1}>
          <Text variant="header-1">{title}</Text>
          <Text variant="body-1" color="secondary">
            {selectedCount > 0
              ? `Выбрано: ${selectedCount} из ${ORDERS.length}`
              : `Всего заказов: ${ORDERS.length}`}
          </Text>
        </Flex>
        <Flex alignItems="center" gap={3}>
          {selectedCount > 0 && (
            <Button view="flat" onClick={() => setRowSelection({})}>
              Снять выделение
            </Button>
          )}
          <Switch checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
        </Flex>
      </Flex>

      {/* Horizontal scroll lives inside the table container, not on the page. */}
      <div className="orders-page__table">
        <OrdersTable
          orders={ORDERS}
          grouped={grouped}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </div>
    </Flex>
  );
}

function Placeholder({title}: {title: string}) {
  return (
    <Flex direction="column" gap={2} className="placeholder">
      <Text variant="header-1">{title}</Text>
      <Text variant="body-1" color="secondary">
        Раздел пока пуст
      </Text>
    </Flex>
  );
}

export function App() {
  const [compact, setCompact] = React.useState(false);
  const [section, setSection] = React.useState<SectionId>('orders');

  const menuItems = React.useMemo<MenuItem[]>(
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

  const title = SECTIONS.find((item) => item.id === section)?.title ?? '';

  return (
    <AsideHeader
      logo={{text: 'Админка', icon: ShoppingCart, iconSize: 24}}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderContent={() => (
        <main className="content">
          {section === 'home' || section === 'orders' ? (
            <OrdersPage key={section} title={section === 'home' ? 'Главная' : 'Заказы'} />
          ) : (
            <Placeholder title={title} />
          )}
        </main>
      )}
    />
  );
}
