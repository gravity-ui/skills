import React from 'react';
import { Button, Icon, Text, Tooltip } from '@gravity-ui/uikit';
import { ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart } from '@gravity-ui/icons';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export const SECTIONS: { id: SectionId; title: string; icon: React.ComponentProps<typeof Icon>['data'] }[] = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'users', title: 'Пользователи', icon: Persons },
  { id: 'orders', title: 'Заказы', icon: ShoppingCart },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

interface SidebarProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ active, onSelect, collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`}>
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden>A</span>
        {!collapsed && (
          <Text variant="subheader-2" ellipsis>
            Админка
          </Text>
        )}
      </div>

      <nav aria-label="Основная навигация" className="sidebar__nav">
        <ul>
          {SECTIONS.map((s) => {
            const isActive = s.id === active;
            const item = (
              <button
                type="button"
                className={`sidebar__item${isActive ? ' sidebar__item_active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={collapsed ? s.title : undefined}
                onClick={() => onSelect(s.id)}
              >
                <Icon data={s.icon} size={18} />
                {!collapsed && <span className="sidebar__label">{s.title}</span>}
              </button>
            );
            return (
              <li key={s.id}>
                {collapsed ? (
                  <Tooltip content={s.title} placement="right">
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

      <div className="sidebar__footer">
        <Button
          view="flat"
          size="m"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        >
          <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={16} />
          {!collapsed && 'Свернуть'}
        </Button>
      </div>
    </aside>
  );
}
