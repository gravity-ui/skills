import React from 'react';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import {ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export const SECTIONS: {id: SectionId; title: string; icon: typeof House}[] = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

const STORAGE_KEY = 'admin.sidebar.collapsed';

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

interface SidebarProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}

export function Sidebar({active, onSelect}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(readCollapsed);

  const toggle = () => {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(STORAGE_KEY, prev ? '0' : '1');
      } catch {
        /* storage may be unavailable */
      }
      return !prev;
    });
  };

  return (
    <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`}>
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          A
        </span>
        <span className="sidebar__brand-name">Admin</span>
      </div>

      <nav className="sidebar__nav" aria-label="Основная навигация">
        <ul className="sidebar__list">
          {SECTIONS.map(({id, title, icon}) => {
            const isActive = id === active;
            return (
              <li key={id}>
                <Tooltip content={title} placement="right" disabled={!collapsed}>
                  <button
                    type="button"
                    className={`sidebar__item${isActive ? ' sidebar__item_active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={collapsed ? title : undefined}
                    onClick={() => onSelect(id)}
                  >
                    <Icon data={icon} size={18} className="sidebar__icon" />
                    <span className="sidebar__label">{title}</span>
                  </button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <Button
          view="flat"
          size="m"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        >
          <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} />
          {collapsed ? null : 'Свернуть'}
        </Button>
      </div>
    </aside>
  );
}
