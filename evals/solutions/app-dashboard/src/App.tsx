import {useState} from 'react';
import {Gear, Ghost, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import {AsideHeader} from '@gravity-ui/navigation';
import type {AsideHeaderItem} from '@gravity-ui/navigation';

import {OrdersPage} from './OrdersPage';

const SECTIONS = [
    {id: 'main', title: 'Главная', icon: House},
    {id: 'users', title: 'Пользователи', icon: Persons},
    {id: 'orders', title: 'Заказы', icon: ShoppingCart},
    {id: 'settings', title: 'Настройки', icon: Gear},
];

export function App() {
    const [compact, setCompact] = useState(false);
    const [currentSection, setCurrentSection] = useState('orders');

    const menuItems: AsideHeaderItem[] = SECTIONS.map((section) => ({
        ...section,
        current: section.id === currentSection,
        onItemClick: () => setCurrentSection(section.id),
    }));

    return (
        <AsideHeader
            logo={{text: 'Админка', icon: Ghost}}
            compact={compact}
            onChangeCompact={setCompact}
            menuItems={menuItems}
            renderContent={() => <OrdersPage />}
        />
    );
}
