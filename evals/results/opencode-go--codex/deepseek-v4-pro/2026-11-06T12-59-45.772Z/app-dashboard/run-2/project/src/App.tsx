import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { OrdersTable } from './components/OrdersTable';
import './App.css';

export function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('orders');

  const handleNavigate = useCallback((id: string) => {
    setActiveNav(id);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        active={activeNav}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onNavigate={handleNavigate}
      />
      <main className="app-main">
        <div className="app-content">
          <OrdersTable groupByStatus />
        </div>
      </main>
    </div>
  );
}
