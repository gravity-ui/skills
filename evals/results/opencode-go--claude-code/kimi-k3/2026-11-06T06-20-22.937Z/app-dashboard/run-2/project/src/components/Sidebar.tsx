import React from 'react';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import {ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart} from '@gravity-ui/icons';

export type SectionId = 'dashboard' | 'users' | 'orders' | 'settings';

interface NavItem {
  id: SectionId;
  title: string;
  icon: typeof House;
}

const NAV_ITEMS: NavItem[] = [
  {id: 'dashboard', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: ShoppingCart},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

export const SECTION_TITLES: Record<SectionId, string> = {
  dashboard: 'Главная',
  users: 'Пользователи',
  orders: 'Заказы',
  settings: 'Настройки',
};

interface SidebarProps {
  active: SectionId;
  collapsed: boolean;
  onSelect: (id: SectionId) => void;
  onToggleCollapsed: () => void;
}

export function Sidebar({active, collapsed, onSelect, onToggleCollapsed}: SidebarProps) {
  return (
    <aside className={collapsed ? 'sidebar sidebar_collapsed' : 'sidebar'}>
      <div className="sidebar__logo" title="Админ-панель">
        <span className="sidebar__logo-mark">A</span>
        {!collapsed && <span className="sidebar__logo-text">Админ-панель</span>}
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const button = (
            <button
              key={item.id}
              type="button"
              className={
                item.id === active
                  ? 'sidebar__item sidebar__item_active'
                  : 'sidebar__item'
              }
              onClick={() => onSelect(item.id)}
            >
              <Icon data={item.icon} size={18} />
              {!collapsed && <span className="sidebar__item-title">{item.title}</span>}
            </button>
          );

          return collapsed ? (
            <Tooltip key={item.id} content={item.title} placement="right">
              {button}
            </Tooltip>
          ) : (
            <React.Fragment key={item.id}>{button}</React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <Tooltip
          content={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          placement="right"
          disabled={!collapsed}
        >
          <Button
            view="flat"
            size="l"
            onClick={onToggleCollapsed}
            className="sidebar__collapse-btn"
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} />
            {!collapsed && <span>Свернуть</span>}
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
}
