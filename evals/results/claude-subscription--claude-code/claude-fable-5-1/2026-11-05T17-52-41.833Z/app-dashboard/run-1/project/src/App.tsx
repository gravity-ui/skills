import * as React from 'react';
import { Icon, PlaceholderContainer } from '@gravity-ui/uikit';
import { Gear, Persons } from '@gravity-ui/icons';

import { ORDERS } from './data/orders';
import { OrdersPage } from './components/OrdersPage';
import { Sidebar, SECTIONS } from './components/Sidebar';
import type { SectionId } from './components/Sidebar';
import './App.css';

const STORAGE_KEY = 'admin.sidebar.collapsed';

export function App() {
  const [section, setSection] = React.useState<SectionId>('home');
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () =>
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* storage unavailable — ignore */
      }
      return next;
    });

  const sectionTitle = SECTIONS.find((s) => s.id === section)?.title ?? '';

  return (
    <div className={`layout${collapsed ? ' layout_collapsed' : ''}`}>
      <Sidebar active={section} collapsed={collapsed} onSelect={setSection} onToggle={toggleSidebar} />
      <main className="layout__main">
        {section === 'home' && (
          <OrdersPage orders={ORDERS} title="Главная" description="Последние заказы магазина за три недели" />
        )}
        {section === 'orders' && <OrdersPage orders={ORDERS} title="Заказы" description="Все заказы" />}
        {(section === 'users' || section === 'settings') && (
          <div className="layout__placeholder">
            <PlaceholderContainer
              title={sectionTitle}
              description="Этот раздел пока в разработке."
              image={<Icon data={section === 'users' ? Persons : Gear} size={96} className="layout__placeholder-icon" />}
              size="m"
            />
          </div>
        )}
      </main>
    </div>
  );
}
