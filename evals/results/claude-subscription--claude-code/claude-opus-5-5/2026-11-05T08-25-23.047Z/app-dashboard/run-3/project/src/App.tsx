import * as React from 'react';
import {Text} from '@gravity-ui/uikit';

import './App.css';
import {generateOrders} from './data';
import {OrdersTable} from './OrdersTable';
import type {SectionId} from './Sidebar';
import {SECTIONS, Sidebar} from './Sidebar';
import {usePersistentState} from './usePersistentState';

const DEFAULT_SECTION: SectionId = 'orders';
const ORDERS = generateOrders(320);

function readSection(): SectionId {
    const hash = window.location.hash.slice(1);
    return SECTIONS.some((s) => s.id === hash) ? (hash as SectionId) : DEFAULT_SECTION;
}

/** Активный раздел живёт в URL-хеше: переживает перезагрузку и работает с кнопками «назад/вперёд». */
function useSection() {
    const [section, setSection] = React.useState(readSection);
    React.useEffect(() => {
        const onChange = () => setSection(readSection());
        window.addEventListener('hashchange', onChange);
        return () => window.removeEventListener('hashchange', onChange);
    }, []);
    return section;
}

function SectionStub({id}: {id: SectionId}) {
    const title = SECTIONS.find((s) => s.id === id)!.title;
    return (
        <section className="stub">
            <Text variant="header-1" as="h1">
                {title}
            </Text>
            <Text color="secondary">Раздел пока пуст. Таблица заказов — в разделе «Заказы».</Text>
        </section>
    );
}

export function App() {
    const section = useSection();
    const [collapsed, setCollapsed] = usePersistentState('sidebar.collapsed', (raw) => raw === true);

    return (
        <div className="app">
            <Sidebar active={section} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
            <main className="app__main">
                {section === 'orders' ? <OrdersTable orders={ORDERS} /> : <SectionStub id={section} />}
            </main>
        </div>
    );
}
