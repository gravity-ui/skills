import React from 'react';
import {Text} from '@gravity-ui/uikit';
import './App.css';
import {SECTIONS, Sidebar, type SectionId} from './Sidebar';
import {OrdersTable} from './OrdersTable';

export function App() {
  const [section, setSection] = React.useState<SectionId>('home');
  const title = SECTIONS.find((s) => s.id === section)!.title;
  const showOrders = section === 'home' || section === 'orders';

  return (
    <div className="layout">
      <Sidebar active={section} onSelect={setSection} />
      <main className="layout__main">
        <Text variant="header-1" as="h1" className="layout__title">
          {section === 'home' ? 'Заказы' : title}
        </Text>
        {showOrders ? (
          <OrdersTable />
        ) : (
          <Text color="secondary">Раздел «{title}» пока пуст.</Text>
        )}
      </main>
    </div>
  );
}
