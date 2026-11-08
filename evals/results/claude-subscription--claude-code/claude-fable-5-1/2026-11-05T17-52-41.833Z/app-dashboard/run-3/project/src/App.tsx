import * as React from 'react';

import { OrdersTable } from './orders/OrdersTable';
import { SectionPlaceholder } from './pages/SectionPlaceholder';
import { SECTIONS, Sidebar, type SectionId } from './sidebar/Sidebar';

import './App.css';

const SIDEBAR_STORAGE_KEY = 'admin.sidebar.collapsed';

function readStoredCollapsed(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function App() {
  const [section, setSection] = React.useState<SectionId>('orders');
  const [collapsed, setCollapsed] = React.useState(readStoredCollapsed);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      // storage is unavailable (private mode, quota) — the preference just won't persist
    }
  }, [collapsed]);

  const current = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

  return (
    <div className="app">
      <Sidebar
        active={section}
        collapsed={collapsed}
        onSelect={setSection}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
      />
      <main className="app__main">
        <div className="app__content">
          {section === 'orders' ? (
            <OrdersTable />
          ) : (
            <SectionPlaceholder section={current} onGoToOrders={() => setSection('orders')} />
          )}
        </div>
      </main>
    </div>
  );
}
