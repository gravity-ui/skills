import React from 'react';

import {Boxes3, Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {AsideHeader, type AsideHeaderItem} from '@gravity-ui/navigation';
import {Box, Flex, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './OrdersTable';
import {PlaceholderPage} from './PlaceholderPage';

import './app.css';

type PageId = 'main' | 'users' | 'orders' | 'settings';

const PAGE_TITLES: Record<PageId, string> = {
    main: 'Главная',
    users: 'Пользователи',
    orders: 'Заказы',
    settings: 'Настройки',
};

const PAGE_ICONS = {
    main: House,
    users: Persons,
    orders: ShoppingCart,
    settings: Gear,
} as const;

const PAGE_ORDER: PageId[] = ['main', 'users', 'orders', 'settings'];

export function App() {
    const [compact, setCompact] = React.useState(false);
    const [page, setPage] = React.useState<PageId>('orders');

    const menuItems = React.useMemo<AsideHeaderItem[]>(
        () =>
            PAGE_ORDER.map((id) => ({
                id,
                title: PAGE_TITLES[id],
                icon: PAGE_ICONS[id],
                current: page === id,
                onItemClick: () => setPage(id),
                qa: `nav-${id}`,
            })),
        [page],
    );

    const renderContent = () => {
        if (page === 'orders') {
            return (
                <div className="app-page-scroll">
                    <Box spacing={{p: 6}}>
                        <Flex direction="column" gap={5}>
                            <Text variant="header-1">Заказы</Text>
                            <OrdersTable />
                        </Flex>
                    </Box>
                </div>
            );
        }

        const descriptions: Record<Exclude<PageId, 'orders'>, string> = {
            main: 'Сводная информация по магазину. Основной раздел — «Заказы».',
            users: 'Управление пользователями магазина.',
            settings: 'Параметры административной панели.',
        };

        return (
            <div className="app-page-scroll">
                <PlaceholderPage title={PAGE_TITLES[page]} description={descriptions[page]} />
            </div>
        );
    };

    return (
        <AsideHeader
            logo={{text: 'Админка', icon: Boxes3}}
            compact={compact}
            onChangeCompact={setCompact}
            menuItems={menuItems}
            renderContent={renderContent}
        />
    );
}
