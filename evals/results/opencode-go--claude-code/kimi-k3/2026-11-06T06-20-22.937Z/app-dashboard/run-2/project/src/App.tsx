import React from 'react';
import {Card, Switch, Text} from '@gravity-ui/uikit';

import {SectionId, SECTION_TITLES, Sidebar} from './components/Sidebar';
import {OrdersTable} from './components/OrdersTable';
import {ORDERS, STATUS_META, STATUS_ORDER, formatRub} from './data/orders';

import './styles.css';

function DashboardPage() {
  const revenue = ORDERS.filter((o) => o.status !== 'cancelled').reduce(
    (s, o) => s + o.amount,
    0,
  );
  const stats = [
    {title: 'Всего заказов', value: String(ORDERS.length)},
    {title: 'Выручка', value: formatRub(revenue)},
    {
      title: 'Новые заказы',
      value: String(ORDERS.filter((o) => o.status === 'new').length),
    },
    {
      title: 'Доставлено',
      value: String(ORDERS.filter((o) => o.status === 'delivered').length),
    },
  ];

  return (
    <div>
      <div className="stat-cards">
        {stats.map((s) => (
          <Card key={s.title} className="stat-card" view="filled">
            <Text variant="header-1">{s.value}</Text>
            <Text color="secondary">{s.title}</Text>
          </Card>
        ))}
      </div>
      <Text color="secondary">
        Сводка по магазину. Перейдите в раздел «Заказы», чтобы работать с таблицей
        заказов: выделять строки, перетаскивать колонки и группировать по статусу.
      </Text>
      <div className="stat-cards" style={{marginTop: 16}}>
        {STATUS_ORDER.map((status) => (
          <Card key={status} className="stat-card" view="outlined">
            <Text variant="header-2">
              {ORDERS.filter((o) => o.status === status).length}
            </Text>
            <Text color="secondary">{STATUS_META[status].title}</Text>
          </Card>
        ))}
      </div>
    </div>
  );
}

const USERS = [
  {name: 'Иван Петров', role: 'Администратор', email: 'ivan@example.com'},
  {name: 'Мария Сидорова', role: 'Менеджер', email: 'maria@example.com'},
  {name: 'Алексей Смирнов', role: 'Менеджер', email: 'alexey@example.com'},
  {name: 'Елена Кузнецова', role: 'Наблюдатель', email: 'elena@example.com'},
];

function UsersPage() {
  return (
    <div className="users-list">
      {USERS.map((u) => (
        <Card key={u.email} className="user-card" view="filled">
          <div>
            <Text variant="subheader-2">{u.name}</Text>
            <div>
              <Text color="secondary">{u.email}</Text>
            </div>
          </div>
          <Text color="secondary">{u.role}</Text>
        </Card>
      ))}
    </div>
  );
}

function SettingsPage() {
  const [emailNotif, setEmailNotif] = React.useState(true);
  const [pushNotif, setPushNotif] = React.useState(false);
  const [autoGroup, setAutoGroup] = React.useState(true);

  return (
    <Card view="filled" className="settings-card">
      <Text variant="subheader-3">Уведомления и отображение</Text>
      <div className="settings-list">
        <Switch
          checked={emailNotif}
          onUpdate={setEmailNotif}
          content="Письма о новых заказах на почту"
        />
        <Switch
          checked={pushNotif}
          onUpdate={setPushNotif}
          content="Push-уведомления в браузере"
        />
        <Switch
          checked={autoGroup}
          onUpdate={setAutoGroup}
          content="Группировать заказы по статусу по умолчанию"
        />
      </div>
    </Card>
  );
}

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
      <main className="main">
        <header className="main__header">
          <Text variant="header-1">{SECTION_TITLES[section]}</Text>
        </header>
        <div className="main__content">
          {section === 'dashboard' && <DashboardPage />}
          {section === 'users' && <UsersPage />}
          {section === 'orders' && <OrdersTable />}
          {section === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}
