import React from 'react';
import {Card, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './OrdersTable';
import {SECTIONS, Sidebar, type SectionId} from './Sidebar';
import {ORDERS, STATUS_CONFIG, formatAmount} from './ordersData';
import './styles.css';

export function App() {
    const [activeSection, setActiveSection] = React.useState<SectionId>('orders');
    const [collapsed, setCollapsed] = React.useState(false);

    const sectionTitle = SECTIONS.find((s) => s.id === activeSection)?.title ?? '';

    return (
        <div className="app">
            <Sidebar
                active={activeSection}
                collapsed={collapsed}
                onSelect={setActiveSection}
                onToggleCollapsed={() => setCollapsed((v) => !v)}
            />
            <div className="app__content">
                <header className="app__header">
                    <Text variant="header-1">{sectionTitle}</Text>
                </header>
                <main className="app__main">
                    {activeSection === 'orders' && <OrdersTable />}
                    {activeSection === 'home' && <HomeSection onOpenOrders={() => setActiveSection('orders')} />}
                    {activeSection === 'users' && (
                        <Placeholder
                            title="Пользователи"
                            description="Раздел управления пользователями. Здесь будут роли, доступы и профили клиентов."
                        />
                    )}
                    {activeSection === 'settings' && (
                        <Placeholder
                            title="Настройки"
                            description="Общие настройки магазина: уведомления, интеграции, оплата и доставка."
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

function HomeSection({onOpenOrders}: {onOpenOrders: () => void}) {
    const total = ORDERS.length;
    const revenue = ORDERS.reduce((sum, o) => sum + o.amount, 0);
    const byStatus = (status: keyof typeof STATUS_CONFIG) =>
        ORDERS.filter((o) => o.status === status).length;

    const stats = [
        {title: 'Всего заказов', value: String(total)},
        {title: 'Выручка', value: formatAmount(revenue)},
        {title: 'Новые', value: String(byStatus('new'))},
        {title: 'Доставлено', value: String(byStatus('delivered'))},
    ];

    return (
        <div className="home">
            <div className="home__stats">
                {stats.map((s) => (
                    <Card key={s.title} className="home__stat" view="outlined">
                        <Text variant="body-2" color="secondary">
                            {s.title}
                        </Text>
                        <Text variant="display-1">{s.value}</Text>
                    </Card>
                ))}
            </div>
            <Text variant="body-2" color="secondary">
                Таблица заказов находится в разделе{' '}
                <button type="button" className="home__link" onClick={onOpenOrders}>
                    «Заказы»
                </button>
                .
            </Text>
        </div>
    );
}

function Placeholder({title, description}: {title: string; description: string}) {
    return (
        <Card view="outlined" className="placeholder">
            <Text variant="subheader-2">{title}</Text>
            <Text variant="body-2" color="secondary">
                {description}
            </Text>
        </Card>
    );
}
