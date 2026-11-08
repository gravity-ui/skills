import { ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart } from '@gravity-ui/icons';
import { Button, Icon, Text, Tooltip } from '@gravity-ui/uikit';
import type { IconData } from '@gravity-ui/uikit';

import './Sidebar.css';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export interface SectionConfig {
  id: SectionId;
  title: string;
  icon: IconData;
}

export const SECTIONS: SectionConfig[] = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'users', title: 'Пользователи', icon: Persons },
  { id: 'orders', title: 'Заказы', icon: ShoppingCart },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

interface SidebarProps {
  active: SectionId;
  collapsed: boolean;
  onSelect: (id: SectionId) => void;
  onToggleCollapsed: () => void;
}

export function Sidebar({ active, collapsed, onSelect, onToggleCollapsed }: SidebarProps) {
  const toggleTitle = collapsed ? 'Развернуть меню' : 'Свернуть меню';

  return (
    <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`} aria-label="Боковая панель">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          A
        </span>
        {!collapsed && (
          <Text variant="subheader-2" ellipsis className="sidebar__brand-title">
            Админка
          </Text>
        )}
      </div>

      <nav className="sidebar__nav" aria-label="Разделы">
        <ul className="sidebar__list">
          {SECTIONS.map((section) => {
            const isActive = section.id === active;
            const button = (
              <Button
                view="flat"
                size="l"
                width="max"
                selected={isActive}
                className="sidebar__item"
                onClick={() => onSelect(section.id)}
                extraProps={{ 'aria-current': isActive ? 'page' : undefined, 'aria-label': section.title }}
              >
                <Icon data={section.icon} size={16} />
                {!collapsed && <span className="sidebar__item-title">{section.title}</span>}
              </Button>
            );
            return (
              <li key={section.id} className="sidebar__list-item">
                {collapsed ? (
                  <Tooltip content={section.title} placement="right">
                    {button}
                  </Tooltip>
                ) : (
                  button
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <Tooltip content={toggleTitle} placement="right" disabled={!collapsed}>
          <Button
            view="flat-secondary"
            size="l"
            width="max"
            className="sidebar__item"
            onClick={onToggleCollapsed}
            extraProps={{ 'aria-label': toggleTitle, 'aria-expanded': !collapsed }}
          >
            <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={16} />
            {!collapsed && <span className="sidebar__item-title">Свернуть</span>}
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
}
