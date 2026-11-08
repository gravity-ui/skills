import React from 'react';
import { Text } from '@gravity-ui/uikit';
import { OrdersTable } from './OrdersTable';
import { SECTIONS, Sidebar, type SectionId } from './Sidebar';
import './app.css';

const STORAGE_KEY = 'admin.sidebar.collapsed';

export function App() {
  const [section, setSection] = React.useState<SectionId>('orders');
  const [collapsed, setCollapsed] = React.useState(() => localStorage.getItem(STORAGE_KEY) === '1');

  const toggle = () =>
    setCollapsed((c) => {
      localStorage.setItem(STORAGE_KEY, c ? '0' : '1');
      return !c;
    });

  return (
    <div className="layout">
      <Sidebar active={section} onSelect={setSection} collapsed={collapsed} onToggle={toggle} />
      <main className="layout__content">
        {section === 'orders' ? (
          <OrdersTable />
        ) : (
          <div>
            <Text variant="header-1" as="h1">
              {SECTIONS.find((s) => s.id === section)!.title}
            </Text>
            <Text as="p" color="secondary">
              Раздел пока пуст.
            </Text>
          </div>
        )}
      </main>
    </div>
  );
}
