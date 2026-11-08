import React from 'react';
import {Button, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import {
    ChevronsCollapseHorizontal,
    ChevronsExpandHorizontal,
    Gear,
    House,
    LayoutHeaderSideContent,
    Persons,
    ShoppingBag,
} from '@gravity-ui/icons';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export const SECTIONS: {id: SectionId; title: string; icon: typeof House}[] = [
    {id: 'home', title: 'Главная', icon: House},
    {id: 'users', title: 'Пользователи', icon: Persons},
    {id: 'orders', title: 'Заказы', icon: ShoppingBag},
    {id: 'settings', title: 'Настройки', icon: Gear},
];

interface SidebarProps {
    active: SectionId;
    collapsed: boolean;
    onSelect: (id: SectionId) => void;
    onToggleCollapsed: () => void;
}

export function Sidebar({active, collapsed, onSelect, onToggleCollapsed}: SidebarProps) {
    return (
        <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`}>
            <div className="sidebar__brand">
                <span className="sidebar__logo">
                    <Icon data={LayoutHeaderSideContent} size={20} />
                </span>
                {!collapsed && (
                    <Text variant="subheader-2" className="sidebar__brand-name">
                        Админка
                    </Text>
                )}
            </div>

            <nav className="sidebar__nav">
                {SECTIONS.map(({id, title, icon}) => {
                    const button = (
                        <button
                            key={id}
                            type="button"
                            className={`sidebar__item${active === id ? ' sidebar__item_active' : ''}`}
                            onClick={() => onSelect(id)}
                            aria-current={active === id ? 'page' : undefined}
                            aria-label={title}
                        >
                            <Icon data={icon} size={18} />
                            {!collapsed && <span className="sidebar__item-label">{title}</span>}
                        </button>
                    );
                    return collapsed ? (
                        <Tooltip key={id} content={title} placement="right">
                            {button}
                        </Tooltip>
                    ) : (
                        <React.Fragment key={id}>{button}</React.Fragment>
                    );
                })}
            </nav>

            <div className="sidebar__footer">
                <Tooltip
                    content={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
                    placement="right"
                    disabled={!collapsed}
                >
                    <Button
                        view="flat"
                        size="l"
                        onClick={onToggleCollapsed}
                        className="sidebar__collapse-btn"
                        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
                    >
                        <Icon
                            data={collapsed ? ChevronsExpandHorizontal : ChevronsCollapseHorizontal}
                            size={18}
                        />
                        {!collapsed && 'Свернуть'}
                    </Button>
                </Tooltip>
            </div>
        </aside>
    );
}
