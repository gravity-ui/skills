import * as React from 'react';

import {Gear, House, Persons, ShoppingBag, ShoppingCart} from '@gravity-ui/icons';
import {AsideHeader} from '@gravity-ui/navigation';
import type {AsideHeaderItem} from '@gravity-ui/navigation';
import {Flex, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './orders/OrdersTable';

import './App.css';

type PageId = 'home' | 'users' | 'orders' | 'settings';

const PAGES: {id: PageId; title: string; icon: AsideHeaderItem['icon']}[] = [
    {id: 'home', title: 'Главная', icon: House},
    {id: 'users', title: 'Пользователи', icon: Persons},
    {id: 'orders', title: 'Заказы', icon: ShoppingCart},
    {id: 'settings', title: 'Настройки', icon: Gear},
];

function PlaceholderPage({title}: {title: string}) {
    return (
        <Flex direction="column" gap={2}>
            <Text variant="header-1">{title}</Text>
            <Text color="secondary">Раздел в разработке.</Text>
        </Flex>
    );
}

export function App() {
    const [compact, setCompact] = React.useState(false);
    const [page, setPage] = React.useState<PageId>('orders');

    const menuItems = React.useMemo<AsideHeaderItem[]>(
        () =>
            PAGES.map(({id, title, icon}) => ({
                id,
                title,
                icon,
                current: id === page,
                onItemClick: () => setPage(id),
            })),
        [page],
    );

    const currentPage = PAGES.find((item) => item.id === page);

    return (
        <AsideHeader
            logo={{text: 'Админка', icon: ShoppingBag, 'aria-label': 'Админка'}}
            compact={compact}
            onChangeCompact={setCompact}
            collapseTitle="Свернуть меню"
            expandTitle="Развернуть меню"
            menuItems={menuItems}
            renderContent={() => (
                <main className="app-content">
                    {page === 'orders' ? (
                        <Flex direction="column" gap={4} className="app-content__page">
                            <Text variant="header-1">Заказы</Text>
                            <OrdersTable />
                        </Flex>
                    ) : (
                        <PlaceholderPage title={currentPage?.title ?? ''} />
                    )}
                </main>
            )}
        />
    );
}
