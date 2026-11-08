import {ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import type {IconData} from '@gravity-ui/uikit';
import {Icon, Tooltip} from '@gravity-ui/uikit';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export const SECTIONS: {id: SectionId; title: string; icon: IconData}[] = [
    {id: 'home', title: 'Главная', icon: House},
    {id: 'users', title: 'Пользователи', icon: Persons},
    {id: 'orders', title: 'Заказы', icon: ShoppingCart},
    {id: 'settings', title: 'Настройки', icon: Gear},
];

interface SidebarProps {
    active: SectionId;
    collapsed: boolean;
    onToggleCollapsed: () => void;
}

/** Подсказка нужна только в свёрнутом виде — в развёрнутом подпись и так видна. */
function WithTooltip({show, title, children}: {show: boolean; title: string; children: React.ReactElement}) {
    return (
        <Tooltip content={title} placement="right" disabled={!show} openDelay={150}>
            {children}
        </Tooltip>
    );
}

export function Sidebar({active, collapsed, onToggleCollapsed}: SidebarProps) {
    const toggleTitle = collapsed ? 'Развернуть меню' : 'Свернуть меню';

    return (
        <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`}>
            <div className="sidebar__brand">
                <span className="sidebar__logo" aria-hidden>
                    A
                </span>
                <span className="sidebar__brand-name">Админка</span>
            </div>

            <nav className="sidebar__nav" aria-label="Основные разделы">
                <ul className="sidebar__list">
                    {SECTIONS.map((section) => {
                        const isActive = section.id === active;
                        return (
                            <li key={section.id}>
                                <WithTooltip show={collapsed} title={section.title}>
                                    <a
                                        href={`#${section.id}`}
                                        className={`sidebar__item${isActive ? ' sidebar__item_active' : ''}`}
                                        aria-current={isActive ? 'page' : undefined}
                                        aria-label={collapsed ? section.title : undefined}
                                    >
                                        <Icon data={section.icon} size={18} className="sidebar__icon" />
                                        <span className="sidebar__label">{section.title}</span>
                                    </a>
                                </WithTooltip>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <WithTooltip show={collapsed} title={toggleTitle}>
                <button
                    type="button"
                    className="sidebar__item sidebar__toggle"
                    onClick={onToggleCollapsed}
                    aria-expanded={!collapsed}
                    aria-label={toggleTitle}
                >
                    <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} className="sidebar__icon" />
                    <span className="sidebar__label">Свернуть</span>
                </button>
            </WithTooltip>
        </aside>
    );
}
