import React from 'react';

import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {AsideHeader, FooterItem, type AsideHeaderItem} from '@gravity-ui/navigation';
import {Gear, House, Moon, Persons, ShoppingCart, Sun} from '@gravity-ui/icons';

import {OrdersPage} from './pages/OrdersPage';
import {StubPage} from './pages/StubPage';

configure({lang: 'ru'});

type PageId = 'home' | 'users' | 'orders' | 'settings';

const PAGE_TITLES: Record<PageId, string> = {
    home: 'Главная',
    users: 'Пользователи',
    orders: 'Заказы',
    settings: 'Настройки',
};

export function App() {
    const [compact, setCompact] = React.useState(false);
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
    const [page, setPage] = React.useState<PageId>('orders');

    const menuItems = React.useMemo<AsideHeaderItem[]>(
        () => [
            {
                id: 'home',
                title: PAGE_TITLES.home,
                icon: House,
                current: page === 'home',
                onItemClick: () => setPage('home'),
            },
            {
                id: 'users',
                title: PAGE_TITLES.users,
                icon: Persons,
                current: page === 'users',
                onItemClick: () => setPage('users'),
            },
            {
                id: 'orders',
                title: PAGE_TITLES.orders,
                icon: ShoppingCart,
                current: page === 'orders',
                onItemClick: () => setPage('orders'),
            },
            {
                id: 'settings',
                title: PAGE_TITLES.settings,
                icon: Gear,
                current: page === 'settings',
                onItemClick: () => setPage('settings'),
            },
        ],
        [page],
    );

    return (
        <ThemeProvider theme={theme}>
            <AsideHeader
                logo={{text: 'Админ-панель', icon: ShoppingCart}}
                compact={compact}
                onChangeCompact={setCompact}
                menuItems={menuItems}
                renderContent={() =>
                    page === 'orders' ? (
                        <OrdersPage />
                    ) : (
                        <StubPage title={PAGE_TITLES[page]} />
                    )
                }
                renderFooter={({compact: footerCompact}) => (
                    <FooterItem
                        id="theme-switch"
                        title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                        icon={theme === 'light' ? Moon : Sun}
                        compact={footerCompact}
                        onItemClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    />
                )}
            />
        </ThemeProvider>
    );
}
