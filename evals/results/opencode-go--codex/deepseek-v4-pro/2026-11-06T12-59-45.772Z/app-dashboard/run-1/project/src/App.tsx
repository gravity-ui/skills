import { useState, useCallback } from 'react';

import { Sidebar } from './Sidebar';
import { OrdersTable } from './OrdersTable';
import { orders } from './data';

export function App() {
  const [activeSection, setActiveSection] = useState('orders');

  const handleNavigate = useCallback((id: string) => {
    setActiveSection(id);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div style={{ padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Главная</h2>
            <p style={{ color: 'var(--g-color-text-hint)', marginTop: 8 }}>
              Добро пожаловать в панель администратора.
            </p>
          </div>
        );
      case 'users':
        return (
          <div style={{ padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Пользователи</h2>
            <p style={{ color: 'var(--g-color-text-hint)', marginTop: 8 }}>
              Управление пользователями появится здесь.
            </p>
          </div>
        );
      case 'orders':
        return (
          <div style={{ padding: 24 }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 700 }}>
              Заказы
            </h2>
            <OrdersTable orders={orders} />
          </div>
        );
      case 'settings':
        return (
          <div style={{ padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Настройки</h2>
            <p style={{ color: 'var(--g-color-text-hint)', marginTop: 8 }}>
              Настройки приложения появятся здесь.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--g-color-base-background)',
        }}
      >
        {renderContent()}
      </main>
    </div>
  );
}
