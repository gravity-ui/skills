import { Icon, Tooltip } from '@gravity-ui/uikit';
import { ChevronsLeft, ChevronsRight, Gear, House, Persons, Receipt } from '@gravity-ui/icons';

export const SECTIONS = [
  { id: 'home', label: 'Главная', icon: House },
  { id: 'users', label: 'Пользователи', icon: Persons },
  { id: 'orders', label: 'Заказы', icon: Receipt },
  { id: 'settings', label: 'Настройки', icon: Gear },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

interface SidebarProps {
  active: SectionId;
  collapsed: boolean;
  onNavigate: (id: SectionId) => void;
  onToggle: () => void;
}

export function Sidebar({ active, collapsed, onNavigate, onToggle }: SidebarProps) {
  return (
    <aside className={collapsed ? 'sidebar sidebar--collapsed' : 'sidebar'}>
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          A
        </span>
        {!collapsed && <span className="sidebar__title">Админка</span>}
      </div>

      <nav aria-label="Основная навигация">
        <ul className="sidebar__list">
          {SECTIONS.map((section) => {
            const item = (
              <button
                type="button"
                className="sidebar__item"
                aria-label={section.label}
                aria-current={active === section.id ? 'page' : undefined}
                onClick={() => onNavigate(section.id)}
              >
                <Icon data={section.icon} size={18} />
                {!collapsed && <span>{section.label}</span>}
              </button>
            );

            return (
              <li key={section.id}>
                {collapsed ? (
                  <Tooltip content={section.label} placement="right">
                    {item}
                  </Tooltip>
                ) : (
                  item
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        className="sidebar__toggle"
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        onClick={onToggle}
      >
        <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} />
        {!collapsed && <span>Свернуть</span>}
      </button>
    </aside>
  );
}
