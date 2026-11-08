import './App.css';

import { Text } from '@gravity-ui/uikit';
import { useEffect, useMemo, useState } from 'react';

import { generateOrders } from './orders/data';
import { OrdersPage } from './orders/OrdersPage';
import { SECTIONS, Sidebar, type SectionId } from './Sidebar';
import { usePersistentState } from './usePersistentState';

const ORDERS_COUNT = 400;

function sectionFromHash(): SectionId {
    const id = window.location.hash.slice(1);
    return SECTIONS.some((s) => s.id === id) ? (id as SectionId) : 'orders';
}

export function App() {
    const [section, setSection] = useState<SectionId>(sectionFromHash);
    const [collapsed, setCollapsed] = usePersistentState(
        'sidebar.collapsed',
        () => window.innerWidth < 900,
        (raw) => raw === true,
    );
    const [orders, setOrders] = useState(() => generateOrders(ORDERS_COUNT));

    // Раздел живёт в URL: работают перезагрузка и кнопки «назад/вперёд».
    useEffect(() => {
        const onHashChange = () => setSection(sectionFromHash());
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    const navigate = (id: SectionId) => {
        if (id !== section) window.location.hash = id;
    };

    const newOrders = useMemo(() => orders.filter((o) => o.status === 'new').length, [orders]);
    const title = SECTIONS.find((s) => s.id === section)!.title;

    useEffect(() => {
        document.title = `${title} — Админка`;
    }, [title]);

    return (
        <div className="layout">
            <Sidebar
                active={section}
                onNavigate={navigate}
                collapsed={collapsed}
                onToggleCollapsed={() => setCollapsed((c) => !c)}
                badges={{ orders: newOrders }}
            />
            <main className="layout__main">
                {section === 'orders' ? (
                    <OrdersPage orders={orders} onOrdersChange={setOrders} />
                ) : (
                    <section className="page page_stub">
                        <Text as="h1" variant="header-1">
                            {title}
                        </Text>
                        <Text color="secondary">Раздел в разработке.</Text>
                    </section>
                )}
            </main>
        </div>
    );
}
