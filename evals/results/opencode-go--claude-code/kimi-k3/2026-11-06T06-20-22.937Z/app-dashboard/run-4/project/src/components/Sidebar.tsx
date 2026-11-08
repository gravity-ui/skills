import React from 'react';
import {Icon, Text} from '@gravity-ui/uikit';
import {ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

const SECTIONS: {id: SectionId; title: string; icon: typeof House}[] = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
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
      <div className="sidebar__header">
        <div className="sidebar__logo">А</div>
        <Text className="sidebar__title" variant="subheader-2" ellipsis>
          Админка
        </Text>
      </div>

      <nav className="sidebar__nav">
        {SECTIONS.map(({id, title, icon}) => (
          <button
            key={id}
            type="button"
            title={title}
            className={`sidebar__item${active === id ? ' sidebar__item_active' : ''}`}
            onClick={() => onSelect(id)}
          >
            <Icon data={icon} size={18} className="sidebar__item-icon" />
            <span className="sidebar__item-label">{title}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button
          type="button"
          className="sidebar__item sidebar__collapse"
          title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          onClick={onToggleCollapsed}
        >
          <Icon
            data={collapsed ? ChevronsRight : ChevronsLeft}
            size={18}
            className="sidebar__item-icon"
          />
          <span className="sidebar__item-label">Свернуть</span>
        </button>
      </div>
    </aside>
  );
}
