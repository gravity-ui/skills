import { ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart } from '@gravity-ui/icons';
import type { IconData } from '@gravity-ui/uikit';
import { Icon, Tooltip } from '@gravity-ui/uikit';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export const SECTIONS: { id: SectionId; title: string; icon: IconData }[] = [
    { id: 'home', title: 'Главная', icon: House },
    { id: 'users', title: 'Пользователи', icon: Persons },
    { id: 'orders', title: 'Заказы', icon: ShoppingCart },
    { id: 'settings', title: 'Настройки', icon: Gear },
];

interface SidebarProps {
    active: SectionId;
    onNavigate: (id: SectionId) => void;
    collapsed: boolean;
    onToggleCollapsed: () => void;
    /** Счётчики рядом с пунктами меню (например, новые заказы). */
    badges?: Partial<Record<SectionId, number>>;
}

export function Sidebar({ active, onNavigate, collapsed, onToggleCollapsed, badges = {} }: SidebarProps) {
    const toggleTitle = collapsed ? 'Развернуть меню' : 'Свернуть меню';

    return (
        <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`}>
            <div className="sidebar__brand">
                <span className="sidebar__logo" aria-hidden>
                    A
                </span>
                <span className="sidebar__label sidebar__brand-name">Админка</span>
            </div>

            <nav className="sidebar__nav" aria-label="Основная навигация">
                <ul className="sidebar__list">
                    {SECTIONS.map((section) => {
                        const isActive = section.id === active;
                        const badge = badges[section.id];
                        return (
                            <li key={section.id}>
                                {/* В свёрнутом виде подпись скрыта — показываем её тултипом. */}
                                <Tooltip content={section.title} placement="right" disabled={!collapsed} openDelay={200}>
                                    <a
                                        href={`#${section.id}`}
                                        className={`sidebar__item${isActive ? ' sidebar__item_active' : ''}`}
                                        aria-current={isActive ? 'page' : undefined}
                                        aria-label={
                                            collapsed ? (badge ? `${section.title}, ${badge} новых` : section.title) : undefined
                                        }
                                        onClick={(e) => {
                                            // Ctrl/Cmd/Shift+клик — открыть в новой вкладке/окне, как у обычной ссылки.
                                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                                            e.preventDefault();
                                            onNavigate(section.id);
                                        }}
                                    >
                                        <span className="sidebar__icon">
                                            <Icon data={section.icon} size={18} />
                                            {badge ? <span className="sidebar__dot" aria-hidden /> : null}
                                        </span>
                                        <span className="sidebar__label">{section.title}</span>
                                        {badge ? (
                                            <span className="sidebar__label sidebar__badge">
                                                {badge}
                                                <span className="visually-hidden"> новых</span>
                                            </span>
                                        ) : null}
                                    </a>
                                </Tooltip>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <Tooltip content={toggleTitle} placement="right" disabled={!collapsed} openDelay={200}>
                <button
                    type="button"
                    className="sidebar__item sidebar__toggle"
                    onClick={onToggleCollapsed}
                    aria-expanded={!collapsed}
                    aria-label={collapsed ? toggleTitle : undefined}
                >
                    <span className="sidebar__icon">
                        <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} />
                    </span>
                    <span className="sidebar__label">{toggleTitle}</span>
                </button>
            </Tooltip>
        </aside>
    );
}
