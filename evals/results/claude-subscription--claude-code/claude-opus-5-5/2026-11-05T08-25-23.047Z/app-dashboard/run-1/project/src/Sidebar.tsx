import * as React from 'react';
import { ChevronsLeft, ChevronsRight, Cube, Gear, House, Persons, ShoppingCart } from '@gravity-ui/icons';
import { ActionTooltip, Icon, type IconData } from '@gravity-ui/uikit';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export const SECTIONS: { id: SectionId; title: string; icon: IconData }[] = [
    { id: 'home', title: 'Главная', icon: House },
    { id: 'users', title: 'Пользователи', icon: Persons },
    { id: 'orders', title: 'Заказы', icon: ShoppingCart },
    { id: 'settings', title: 'Настройки', icon: Gear },
];

interface SidebarProps {
    active: SectionId;
    collapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
    badges?: Partial<Record<SectionId, number>>;
}

export function Sidebar({ active, collapsed, onCollapsedChange, badges = {} }: SidebarProps) {
    const toggleTitle = collapsed ? 'Развернуть меню' : 'Свернуть меню';

    return (
        <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`} aria-label="Основная навигация">
            <div className="sidebar__brand">
                <span className="sidebar__logo" aria-hidden>
                    <Icon data={Cube} size={18} />
                </span>
                <span className="sidebar__label sidebar__brand-name">Админка</span>
            </div>

            <nav className="sidebar__nav">
                <ul>
                    {SECTIONS.map((section) => {
                        const isActive = section.id === active;
                        const badge = badges[section.id];
                        return (
                            <li key={section.id}>
                                {/* Подсказка нужна только в свёрнутом виде, когда подписи не видно */}
                                <ActionTooltip title={section.title} placement="right" disabled={!collapsed}>
                                    <a
                                        href={`#/${section.id}`}
                                        className={`sidebar__item${isActive ? ' sidebar__item_active' : ''}`}
                                        aria-current={isActive ? 'page' : undefined}
                                        aria-label={collapsed ? section.title : undefined}
                                    >
                                        <span className="sidebar__icon">
                                            <Icon data={section.icon} size={18} />
                                            {badge ? <span className="sidebar__dot" aria-hidden /> : null}
                                        </span>
                                        <span className="sidebar__label">{section.title}</span>
                                        {badge ? (
                                            <span className="sidebar__badge sidebar__label" aria-label={`${badge} новых`}>
                                                {badge}
                                            </span>
                                        ) : null}
                                    </a>
                                </ActionTooltip>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar__footer">
                <ActionTooltip title={toggleTitle} hotkey="mod+b" placement="right">
                    <button
                        type="button"
                        className="sidebar__item sidebar__toggle"
                        onClick={() => onCollapsedChange(!collapsed)}
                        aria-expanded={!collapsed}
                        aria-label={toggleTitle}
                    >
                        <span className="sidebar__icon">
                            <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} />
                        </span>
                        <span className="sidebar__label">Свернуть</span>
                    </button>
                </ActionTooltip>
            </div>
        </aside>
    );
}

/** Ctrl/Cmd+B — свернуть/развернуть меню. */
export function useSidebarHotkey(toggle: () => void) {
    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'b') {
                const target = e.target as HTMLElement | null;
                if (target?.closest('input, textarea, [contenteditable="true"]')) return;
                e.preventDefault();
                toggle();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [toggle]);
}
