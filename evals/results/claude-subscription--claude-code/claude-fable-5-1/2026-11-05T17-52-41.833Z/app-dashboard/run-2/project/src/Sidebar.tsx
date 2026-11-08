import * as React from 'react';
import { Button, Icon, Text, Tooltip } from '@gravity-ui/uikit';
import { ChevronsLeft, ChevronsRight, Gear, House, Persons, Rocket, ShoppingCart } from '@gravity-ui/icons';
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
  onSelect: (id: SectionId) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Optional counters shown next to a section title (e.g. number of new orders). */
  badges?: Partial<Record<SectionId, number>>;
}

export function Sidebar({ active, onSelect, collapsed, onToggleCollapsed, badges }: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`} aria-label="Основная навигация">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          <Icon data={Rocket} size={18} />
        </span>
        <Text variant="subheader-2" className="sidebar__brand-title" ellipsis>
          Панель управления
        </Text>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {SECTIONS.map((section) => {
            const isActive = section.id === active;
            const badge = badges?.[section.id];
            return (
              <li key={section.id}>
                <Tooltip content={section.title} placement="right" disabled={!collapsed}>
                  <button
                    type="button"
                    className={`sidebar__item${isActive ? ' sidebar__item_active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={collapsed ? section.title : undefined}
                    onClick={() => onSelect(section.id)}
                  >
                    <span className="sidebar__item-icon">
                      <Icon data={section.icon} size={18} />
                      {collapsed && badge ? <span className="sidebar__dot" aria-hidden="true" /> : null}
                    </span>
                    <span className="sidebar__item-title">{section.title}</span>
                    {!collapsed && badge ? <span className="sidebar__badge">{badge}</span> : null}
                  </button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <Tooltip content="Развернуть меню" placement="right" disabled={!collapsed}>
          <Button
            view="flat-secondary"
            size="l"
            width={collapsed ? undefined : 'max'}
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
            aria-expanded={!collapsed}
            onClick={onToggleCollapsed}
            className="sidebar__toggle"
          >
            <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={16} />
            {!collapsed && 'Свернуть'}
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
}
