import { Bell, Plus, SquareDashed } from '@gravity-ui/icons';
import { Button, Icon, PlaceholderContainer, Text } from '@gravity-ui/uikit';
import * as React from 'react';
import { OrdersTable } from './components/OrdersTable';
import { NAV_ITEMS, Sidebar, type SectionId } from './components/Sidebar';
import { generateOrders, type Order } from './data/orders';
import './App.css';

const SIDEBAR_STORAGE_KEY = 'admin.sidebar.collapsed';

function loadCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function App() {
  const [section, setSection] = React.useState<SectionId>('orders');
  const [collapsed, setCollapsed] = React.useState(loadCollapsed);
  const [orders, setOrders] = React.useState<Order[]>(() => generateOrders(60));

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const newOrders = orders.filter((o) => o.status === 'new').length;
  const title = NAV_ITEMS.find((i) => i.id === section)?.title ?? '';

  return (
    <div className="app">
      <Sidebar
        active={section}
        collapsed={collapsed}
        badges={{ orders: newOrders }}
        onNavigate={setSection}
        onToggleCollapsed={toggleCollapsed}
      />
      <main className="app__main">
        <header className="app__header">
          <div>
            <Text variant="header-1" as="h1" className="app__title">
              {title}
            </Text>
            {section === 'orders' && (
              <Text variant="body-1" color="secondary">
                Всего {orders.length}, новых {newOrders}
              </Text>
            )}
          </div>
          <div className="app__header-actions">
            <Button view="flat" size="l" aria-label="Уведомления">
              <Icon data={Bell} size={18} />
            </Button>
            {section === 'orders' && (
              <Button view="action" size="l">
                <Icon data={Plus} size={16} />
                Новый заказ
              </Button>
            )}
          </div>
        </header>

        {section === 'orders' ? (
          <OrdersTable orders={orders} onOrdersChange={setOrders} />
        ) : (
          <PlaceholderContainer
            size="m"
            image={<Icon data={SquareDashed} size={64} className="app__placeholder-icon" />}
            title={`Раздел «${title}» в разработке`}
            description="Здесь появится содержимое раздела. Перейдите в «Заказы», чтобы работать с таблицей."
            actions={[{ text: 'К заказам', view: 'normal', onClick: () => setSection('orders') }]}
          />
        )}
      </main>
    </div>
  );
}
