import { useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import type { SectionId } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { generateOrders } from './data/orders';
import './app.css';

export function App() {
  const [section, setSection] = useState<SectionId>('home');
  const [collapsed, setCollapsed] = useState(false);
  const orders = useMemo(() => generateOrders(), []);

  const page = (() => {
    switch (section) {
      case 'home':
        return <DashboardPage orders={orders} />;
      case 'orders':
        return <OrdersPage orders={orders} />;
      case 'users':
        return <PlaceholderPage title="Пользователи" description="Список пользователей и их роли." />;
      case 'settings':
        return <PlaceholderPage title="Настройки" description="Параметры аккаунта и интеграции." />;
    }
  })();

  return (
    <div className="app">
      <Sidebar
        active={section}
        collapsed={collapsed}
        onNavigate={setSection}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <main className="main">{page}</main>
    </div>
  );
}
