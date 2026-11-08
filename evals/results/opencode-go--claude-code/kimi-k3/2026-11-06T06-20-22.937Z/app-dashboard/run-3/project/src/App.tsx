import {useMemo, useState} from 'react';
import {Card, Text} from '@gravity-ui/uikit';

import {Sidebar, SECTIONS, type SectionId} from './components/Sidebar';
import {OrdersTable} from './components/OrdersTable';
import {ORDERS, formatAmount} from './data/orders';
import './styles.css';

function StatTile({title, value, hint}: {title: string; value: string; hint?: string}) {
  return (
    <Card className="stat-tile" view="outlined">
      <Text color="secondary" variant="body-1">
        {title}
      </Text>
      <Text variant="display-1" className="stat-tile__value">
        {value}
      </Text>
      {hint && (
        <Text color="secondary" variant="caption-1">
          {hint}
        </Text>
      )}
    </Card>
  );
}

function HomeSection() {
  const stats = useMemo(() => {
    const total = ORDERS.length;
    const revenue = ORDERS.filter((o) => o.status !== 'cancelled').reduce(
      (s, o) => s + o.amount,
      0,
    );
    const active = ORDERS.filter(
      (o) => o.status === 'new' || o.status === 'processing',
    ).length;
    return {
      total,
      revenue,
      active,
      average: total ? Math.round(revenue / Math.max(total, 1)) : 0,
    };
  }, []);

  return (
    <>
      <div className="stat-tiles">
        <StatTile title="Всего заказов" value={String(stats.total)} hint="за всё время" />
        <StatTile title="Выручка" value={formatAmount(stats.revenue)} hint="без отменённых" />
        <StatTile title="Активные заказы" value={String(stats.active)} hint="новые + в обработке" />
        <StatTile title="Средний чек" value={formatAmount(stats.average)} />
      </div>
      <OrdersTable />
    </>
  );
}

function PlaceholderSection({title, description}: {title: string; description: string}) {
  return (
    <Card view="outlined" className="placeholder">
      <Text variant="subheader-3">{title}</Text>
      <Text color="secondary">{description}</Text>
    </Card>
  );
}

export function App() {
  const [section, setSection] = useState<SectionId>('orders');
  const [collapsed, setCollapsed] = useState(false);

  const activeTitle = SECTIONS.find((s) => s.id === section)?.title ?? '';

  return (
    <div className="layout">
      <Sidebar
        active={section}
        collapsed={collapsed}
        onNavigate={setSection}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />
      <main className="main">
        <header className="main__header">
          <Text variant="header-1">{activeTitle}</Text>
        </header>
        {section === 'home' && <HomeSection />}
        {section === 'orders' && <OrdersTable />}
        {section === 'users' && (
          <PlaceholderSection
            title="Пользователи"
            description="Раздел управления пользователями. Здесь будет список аккаунтов, роли и права доступа."
          />
        )}
        {section === 'settings' && (
          <PlaceholderSection
            title="Настройки"
            description="Раздел настроек админки: профиль, уведомления, интеграции."
          />
        )}
      </main>
    </div>
  );
}
