import { useEffect, useMemo, useState } from 'react';
import { Sidebar, type SectionId } from './components/Sidebar';
import { createMockOrders } from './data/orders';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import './styles.css';

const COLLAPSED_KEY = 'admin.sidebar.collapsed';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function App() {
  const [section, setSection] = useState<SectionId>('home');
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);
  const orders = useMemo(() => createMockOrders(), []);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {
      // Хранилище недоступно: состояние просто не запомнится между перезагрузками.
    }
  }, [collapsed]);

  return (
    <div className="app-shell">
      <Sidebar
        active={section}
        onSelect={setSection}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <main className="app-main">
        {section === 'home' && <HomePage orders={orders} />}
        {section === 'orders' && <OrdersPage orders={orders} />}
        {section === 'users' && <PlaceholderPage title="Пользователи" />}
        {section === 'settings' && <PlaceholderPage title="Настройки" />}
      </main>
    </div>
  );
}
