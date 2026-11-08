import {Icon, Text, Tooltip} from '@gravity-ui/uikit';
import {ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';
import type {IconData} from '@gravity-ui/uikit';

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
  onSelect: (id: SectionId) => void;
  onToggle: () => void;
}

export function Sidebar({active, collapsed, onSelect, onToggle}: SidebarProps) {
  return (
    <aside className="sidebar" data-collapsed={collapsed}>
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden>A</span>
        {!collapsed && (
          <Text variant="subheader-2" ellipsis>
            Админка
          </Text>
        )}
      </div>

      <nav className="sidebar__nav" aria-label="Основная навигация">
        <ul>
          {SECTIONS.map(({id, title, icon}) => {
            const item = (
              <button
                type="button"
                className="sidebar__item"
                aria-current={id === active ? 'page' : undefined}
                aria-label={collapsed ? title : undefined}
                onClick={() => onSelect(id)}
              >
                <Icon data={icon} size={18} />
                {!collapsed && <span className="sidebar__label">{title}</span>}
              </button>
            );
            return (
              <li key={id}>
                {collapsed ? (
                  <Tooltip content={title} placement="right" openDelay={100}>
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
        className="sidebar__item sidebar__toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
      >
        <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} />
        {!collapsed && <span className="sidebar__label">Свернуть</span>}
      </button>
    </aside>
  );
}
