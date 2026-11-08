import * as React from 'react';

import {Gear, House, LayoutSideContent, Persons, ShoppingCart} from '@gravity-ui/icons';
import {AsideHeader} from '@gravity-ui/navigation';
import type {AsideHeaderItem} from '@gravity-ui/navigation';
import {Flex, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './orders/OrdersTable';

import './App.css';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: Array<{id: SectionId; title: string; icon: AsideHeaderItem['icon']}> = [
    {id: 'home', title: 'Главная', icon: House},
    {id: 'users', title: 'Пользователи', icon: Persons},
    {id: 'orders', title: 'Заказы', icon: ShoppingCart},
    {id: 'settings', title: 'Настройки', icon: Gear},
];

function SectionPlaceholder({title}: {title: string}) {
    return (
        <Flex direction="column" gap={2}>
            <Text variant="header-1">{title}</Text>
            <Text color="secondary">Раздел в разработке.</Text>
        </Flex>
    );
}

export function App() {
    const [compact, setCompact] = React.useState(false);
    const [section, setSection] = React.useState<SectionId>('orders');

    const menuItems = React.useMemo<AsideHeaderItem[]>(
        () =>
            SECTIONS.map(({id, title, icon}) => ({
                id,
                title,
                icon,
                current: id === section,
                onItemClick: () => setSection(id),
            })),
        [section],
    );

    const current = SECTIONS.find((item) => item.id === section);

    return (
        <AsideHeader
            logo={{text: 'Админка', icon: LayoutSideContent}}
            compact={compact}
            onChangeCompact={setCompact}
            menuItems={menuItems}
            expandTitle="Развернуть навигацию"
            collapseTitle="Свернуть навигацию"
            renderContent={() => (
                <main className="app-page">
                    {section === 'orders' ? (
                        <OrdersTable />
                    ) : (
                        <SectionPlaceholder title={current?.title ?? ''} />
                    )}
                </main>
            )}
        />
    );
}
