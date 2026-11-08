import * as React from 'react';

import {Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {AsideHeader} from '@gravity-ui/navigation';
import type {AsideHeaderItem} from '@gravity-ui/navigation';
import {Flex, Text} from '@gravity-ui/uikit';

import {OrdersTable} from './OrdersTable';

import './App.css';

type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: {id: SectionId; title: string; icon: AsideHeaderItem['icon']; description: string}[] = [
    {id: 'home', title: 'Главная', icon: House, description: 'Сводка по магазину появится здесь.'},
    {id: 'users', title: 'Пользователи', icon: Persons, description: 'Список пользователей и их роли.'},
    {id: 'orders', title: 'Заказы', icon: ShoppingCart, description: 'Все заказы магазина.'},
    {id: 'settings', title: 'Настройки', icon: Gear, description: 'Параметры админки.'},
];

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

    const current = SECTIONS.find(({id}) => id === section) ?? SECTIONS[0];

    return (
        <AsideHeader
            logo={{text: 'Админка', icon: ShoppingCart, onClick: () => setSection('home')}}
            compact={compact}
            onChangeCompact={setCompact}
            collapseTitle="Свернуть меню"
            expandTitle="Развернуть меню"
            headerDecoration
            menuItems={menuItems}
            renderContent={() => (
                <Flex as="main" direction="column" gap={4} className="page">
                    <Flex direction="column" gap={1} className="page__header">
                        <Text variant="header-1">{current.title}</Text>
                        <Text color="secondary">{current.description}</Text>
                    </Flex>
                    {section === 'orders' ? (
                        <OrdersTable />
                    ) : (
                        <Flex className="page__placeholder" alignItems="center" justifyContent="center">
                            <Text color="secondary">Раздел «{current.title}» в разработке</Text>
                        </Flex>
                    )}
                </Flex>
            )}
        />
    );
}
