import * as React from 'react';

import {AsideHeader} from '@gravity-ui/navigation';
import type {AsideHeaderItem} from '@gravity-ui/navigation';
import {Gear, House, LayoutHeaderCells, Persons, ShoppingCart} from '@gravity-ui/icons';
import {Flex, Icon, PlaceholderContainer, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './OrdersTable';
import './App.css';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: {id: SectionId; title: string; icon: AsideHeaderItem['icon']}[] = [
    {id: 'home', title: 'Главная', icon: House},
    {id: 'users', title: 'Пользователи', icon: Persons},
    {id: 'orders', title: 'Заказы', icon: ShoppingCart},
    {id: 'settings', title: 'Настройки', icon: Gear},
];

function SectionPlaceholder({title, onOpenOrders}: {title: string; onOpenOrders: () => void}) {
    return (
        <PlaceholderContainer
            size="m"
            image={<Icon data={LayoutHeaderCells} size={64} className="page__placeholder-icon" />}
            title={`Раздел «${title}» в разработке`}
            description="Здесь появится содержимое раздела. Пока можно перейти к заказам."
            actions={[{text: 'Перейти к заказам', view: 'action', onClick: onOpenOrders}]}
        />
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

    const current = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

    return (
        <AsideHeader
            logo={{text: 'Админка', icon: LayoutHeaderCells, 'aria-label': 'Админка'}}
            headerDecoration
            compact={compact}
            onChangeCompact={setCompact}
            collapseTitle="Свернуть меню"
            expandTitle="Развернуть меню"
            menuItems={menuItems}
            renderContent={() => (
                <Flex direction="column" gap={4} className="page">
                    <Text variant="header-1" as="h1" className="page__title">
                        {current.title}
                    </Text>
                    {section === 'orders' ? (
                        <OrdersTable />
                    ) : (
                        <Flex className="page__placeholder" alignItems="center" justifyContent="center">
                            <SectionPlaceholder
                                title={current.title}
                                onOpenOrders={() => setSection('orders')}
                            />
                        </Flex>
                    )}
                </Flex>
            )}
        />
    );
}
