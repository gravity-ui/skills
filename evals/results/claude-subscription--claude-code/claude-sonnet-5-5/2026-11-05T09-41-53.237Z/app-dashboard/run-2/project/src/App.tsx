import React from 'react';
import {Text} from '@gravity-ui/uikit';

import {OrdersTable} from './OrdersTable';
import {SECTIONS, Sidebar} from './Sidebar';
import type {SectionId} from './Sidebar';
import './app.css';

export function App() {
  const [section, setSection] = React.useState<SectionId>('orders');
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="layout">
      <Sidebar
        active={section}
        collapsed={collapsed}
        onSelect={setSection}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <main className="layout__content">
        {section === 'orders' ? (
          <OrdersTable />
        ) : (
          <div className="layout__placeholder">
            <Text as="h1" variant="header-1">
              {SECTIONS.find((s) => s.id === section)?.title}
            </Text>
            <Text color="secondary">Раздел в разработке</Text>
          </div>
        )}
      </main>
    </div>
  );
}
