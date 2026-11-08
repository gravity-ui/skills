import React from 'react';

import {Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {AsideHeader, type MenuItem} from '@gravity-ui/navigation';
import {Flex, Text, configure} from '@gravity-ui/uikit';

import {OrdersPage} from './OrdersPage';

configure({lang: 'ru'});

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTION_TITLES: Record<SectionId, string> = {
    home: 'Главная',
    users: 'Пользователи',
    orders: 'Заказы',
    settings: 'Настройки',
};

function StubPage({title}: {title: string}) {
    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            style={{height: '100vh'}}
        >
            <Text variant="header-1">{title}</Text>
            <Text variant="body-2" color="secondary">
                Раздел в разработке. Откройте «Заказы», чтобы увидеть таблицу заказов.
            </Text>
        </Flex>
    );
}

export function App() {
    const [compact, setCompact] = React.useState(false);
    const [section, setSection] = React.useState<SectionId>('orders');

    const menuItems = React.useMemo<MenuItem[]>(() => {
        const makeItem = (id: SectionId, icon: MenuItem['icon']): MenuItem => ({
            id,
            title: SECTION_TITLES[id],
            icon,
            current: section === id,
            onItemClick: () => setSection(id),
        });

        return [
            makeItem('home', House),
            makeItem('users', Persons),
            makeItem('orders', ShoppingCart),
            makeItem('settings', Gear),
        ];
    }, [section]);

    return (
        <AsideHeader
            logo={{text: 'Админка', icon: ShoppingCart}}
            compact={compact}
            onChangeCompact={setCompact}
            menuItems={menuItems}
            renderContent={() =>
                section === 'orders' ? (
                    <OrdersPage />
                ) : (
                    <StubPage title={SECTION_TITLES[section]} />
                )
            }
        />
    );
}
