import * as React from 'react';
import { Link, Text, configure } from '@gravity-ui/uikit';

import { OrdersPage } from './orders/OrdersPage';
import { generateOrders, type Order } from './orders/data';
import { SECTIONS, Sidebar, type SectionId, useSidebarHotkey } from './Sidebar';
import { useStoredState } from './useStoredState';

import './App.css';

// Встроенные тексты Gravity UI (TableColumnSetup, ActionsPanel и т.д.) — на русском
configure({ lang: 'ru' });

const DEFAULT_SECTION: SectionId = 'orders';

function readSection(): SectionId {
    const id = window.location.hash.replace(/^#\/?/, '');
    return SECTIONS.some((s) => s.id === id) ? (id as SectionId) : DEFAULT_SECTION;
}

function useHashSection() {
    const [section, setSection] = React.useState(readSection);
    React.useEffect(() => {
        const onChange = () => setSection(readSection());
        window.addEventListener('hashchange', onChange);
        return () => window.removeEventListener('hashchange', onChange);
    }, []);
    return section;
}

export function App() {
    const section = useHashSection();
    const [orders, setOrders] = React.useState<Order[]>(() => generateOrders());
    const [collapsed, setCollapsed] = useStoredState(
        'admin.sidebar.collapsed',
        () => window.innerWidth < 960,
        (v) => v === true,
    );
    const toggleSidebar = React.useCallback(() => setCollapsed((c) => !c), [setCollapsed]);
    useSidebarHotkey(toggleSidebar);

    const newOrders = React.useMemo(() => orders.filter((o) => o.status === 'new').length, [orders]);
    const current = SECTIONS.find((s) => s.id === section)!;

    React.useEffect(() => {
        document.title = `${current.title} · Админка`;
    }, [current.title]);

    return (
        <div className="layout">
            <Sidebar active={section} collapsed={collapsed} onCollapsedChange={setCollapsed} badges={{ orders: newOrders }} />
            <main className="layout__main">
                {section === 'orders' ? (
                    <OrdersPage orders={orders} onOrdersChange={setOrders} />
                ) : (
                    <div className="stub">
                        <Text as="h1" variant="header-1">
                            {current.title}
                        </Text>
                        <Text color="secondary" as="p">
                            Раздел в разработке. Пока можно перейти к <Link href="#/orders">заказам</Link>.
                        </Text>
                    </div>
                )}
            </main>
        </div>
    );
}
