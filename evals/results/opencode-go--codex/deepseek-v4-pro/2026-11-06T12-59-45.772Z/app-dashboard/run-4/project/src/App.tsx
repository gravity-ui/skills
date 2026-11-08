import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { OrdersTable } from './components/OrdersTable';
import { orders } from './data/orders';

const SECTIONS: Record<string, string> = {
  dashboard: 'Главная',
  users: 'Пользователи',
  orders: 'Заказы',
  settings: 'Настройки',
};

export function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('orders');

  const sidebarWidth = collapsed ? 64 : 220;

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <PlaceholderPage
            title="Главная"
            text="Сводная статистика и ключевые метрики."
          />
        );
      case 'users':
        return (
          <PlaceholderPage
            title="Пользователи"
            text="Управление пользователями системы."
          />
        );
      case 'orders':
        return (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--g-color-text-primary)',
                }}
              >
                Заказы
              </h1>
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--g-color-text-secondary)',
                }}
              >
                Всего: {orders.length}
              </span>
            </div>
            <OrdersTable orders={orders} />
          </div>
        );
      case 'settings':
        return (
          <PlaceholderPage
            title="Настройки"
            text="Настройки приложения и профиля."
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--g-color-base-background)' }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        activeSection={activeSection}
        onToggle={() => setCollapsed((c) => !c)}
        onNavigate={setActiveSection}
      />

      {/* Main content */}
      <div
        style={{
          marginLeft: sidebarWidth,
          padding: 32,
          transition: 'margin-left 0.2s ease',
          minHeight: '100vh',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

function PlaceholderPage({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--g-color-text-secondary)',
      }}
    >
      <h1
        style={{
          margin: '0 0 8px',
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--g-color-text-primary)',
        }}
      >
        {title}
      </h1>
      <p style={{ margin: 0, fontSize: 16 }}>{text}</p>
    </div>
  );
}
