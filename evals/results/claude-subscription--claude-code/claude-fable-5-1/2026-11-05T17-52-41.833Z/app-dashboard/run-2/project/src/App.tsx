import * as React from 'react';
import { Text } from '@gravity-ui/uikit';
import { Sidebar, SECTIONS } from './Sidebar';
import type { SectionId } from './Sidebar';
import { OrdersTable } from './OrdersTable';
import { STATUS_META, formatMoney, generateOrders, pluralize } from './orders';
import type { Order } from './orders';
import './App.css';

const STORAGE_KEY = 'admin.sidebar.collapsed';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
}

function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="stat-tile">
      <Text variant="body-1" color="secondary" className="stat-tile__label">
        {label}
      </Text>
      <Text variant="display-1" className="stat-tile__value">
        {value}
      </Text>
      {hint ? (
        <Text variant="caption-2" color="hint">
          {hint}
        </Text>
      ) : null}
    </div>
  );
}

function SectionStub({ title, description }: { title: string; description: string }) {
  return (
    <div className="section-stub">
      <Text variant="subheader-2">{title}</Text>
      <Text variant="body-1" color="secondary">
        {description}
      </Text>
    </div>
  );
}

export function App() {
  const [section, setSection] = React.useState<SectionId>('home');
  const [collapsed, setCollapsed] = React.useState<boolean>(readCollapsed);
  const [orders, setOrders] = React.useState<Order[]>(() => generateOrders());

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* storage unavailable — keep in memory only */
      }
      return next;
    });
  };

  const stats = React.useMemo(() => {
    const active = orders.filter((o) => o.status !== 'cancelled');
    const revenue = active.reduce((sum, o) => sum + o.total, 0);
    const byStatus = (status: Order['status']) => orders.filter((o) => o.status === status).length;
    return {
      total: orders.length,
      revenue,
      newCount: byStatus('new'),
      processing: byStatus('processing'),
      shipped: byStatus('shipped'),
      cancelled: byStatus('cancelled'),
    };
  }, [orders]);

  const current = SECTIONS.find((s) => s.id === section)!;

  return (
    <div className="app">
      <Sidebar
        active={section}
        onSelect={setSection}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        badges={{ orders: stats.newCount }}
      />

      <main className="app__main">
        <header className="app__header">
          <Text variant="header-1" as="h1" className="app__title">
            {current.title}
          </Text>
          <Text variant="body-1" color="secondary">
            {section === 'home' && 'Сводка за последние 30 дней'}
            {section === 'orders' && `${stats.total} ${pluralize(stats.total, ['заказ', 'заказа', 'заказов'])} за последние 30 дней`}
            {section === 'users' && 'Учётные записи и роли'}
            {section === 'settings' && 'Параметры магазина и интеграции'}
          </Text>
        </header>

        {section === 'home' && (
          <>
            <section className="stat-row" aria-label="Ключевые показатели">
              <StatTile label="Всего заказов" value={String(stats.total)} hint="За 30 дней" />
              <StatTile label="Выручка" value={formatMoney(stats.revenue)} hint="Без отменённых заказов" />
              <StatTile
                label={STATUS_META.new.title}
                value={String(stats.newCount)}
                hint="Ожидают подтверждения"
              />
              <StatTile label={STATUS_META.processing.title} value={String(stats.processing)} hint="Собираются на складе" />
              <StatTile label={STATUS_META.shipped.title} value={String(stats.shipped)} hint="В пути к клиенту" />
              <StatTile label={STATUS_META.cancelled.title} value={String(stats.cancelled)} hint="Отказ или возврат" />
            </section>
            <OrdersTable orders={orders} onOrdersChange={setOrders} />
          </>
        )}

        {section === 'orders' && <OrdersTable orders={orders} onOrdersChange={setOrders} />}

        {section === 'users' && (
          <SectionStub
            title="Пользователи"
            description="Список сотрудников и клиентов появится здесь. Раздел пока в разработке."
          />
        )}

        {section === 'settings' && (
          <SectionStub
            title="Настройки"
            description="Здесь будут параметры уведомлений, доставки и интеграций. Раздел пока в разработке."
          />
        )}
      </main>
    </div>
  );
}
