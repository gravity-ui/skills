import { useMemo, useState } from 'react';
import { Sidebar, SECTIONS, type SectionId } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { generateOrders } from './orders/mockOrders';
import './App.css';

export function App() {
  const [section, setSection] = useState<SectionId>('orders');
  const [collapsed, setCollapsed] = useState(false);
  const orders = useMemo(() => generateOrders(), []);

  const title = SECTIONS.find((s) => s.id === section)?.label ?? '';

  return (
    <div className="app-layout">
      <Sidebar
        active={section}
        onSelect={setSection}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
      />
      <main className="app-main">
        {section === 'home' && <HomePage orders={orders} />}
        {section === 'orders' && <OrdersPage orders={orders} />}
        {section === 'users' && <PlaceholderPage title={title} />}
        {section === 'settings' && <PlaceholderPage title={title} />}
      </main>
    </div>
  );
}
