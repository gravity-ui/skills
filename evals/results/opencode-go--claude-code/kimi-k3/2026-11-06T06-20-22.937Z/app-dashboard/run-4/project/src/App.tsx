import React from 'react';
import {Icon, Text} from '@gravity-ui/uikit';
import {Gear, House, Persons} from '@gravity-ui/icons';

import {OrdersTable} from './components/OrdersTable';
import {Sidebar, type SectionId} from './components/Sidebar';

import './styles.css';

const PLACEHOLDERS: Record<Exclude<SectionId, 'orders'>, {title: string; icon: typeof House; text: string}> = {
  home: {
    title: 'Главная',
    icon: House,
    text: 'Сводка по метрикам появится здесь. Пока перейдите в раздел «Заказы».',
  },
  users: {
    title: 'Пользователи',
    icon: Persons,
    text: 'Управление пользователями появится здесь. Пока перейдите в раздел «Заказы».',
  },
  settings: {
    title: 'Настройки',
    icon: Gear,
    text: 'Настройки системы появятся здесь. Пока перейдите в раздел «Заказы».',
  },
};

export function App() {
  const [section, setSection] = React.useState<SectionId>('orders');
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="app">
      <Sidebar
        active={section}
        collapsed={collapsed}
        onSelect={setSection}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
      />
      <main className="app__content">
        {section === 'orders' ? (
          <OrdersTable />
        ) : (
          <div className="app__placeholder">
            <Icon data={PLACEHOLDERS[section].icon} size={40} />
            <Text variant="header-1">{PLACEHOLDERS[section].title}</Text>
            <Text variant="body-2" color="secondary">
              {PLACEHOLDERS[section].text}
            </Text>
          </div>
        )}
      </main>
    </div>
  );
}
