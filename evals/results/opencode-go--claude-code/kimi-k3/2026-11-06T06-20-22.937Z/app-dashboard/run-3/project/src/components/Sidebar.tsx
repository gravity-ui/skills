import {Button, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import {
  ChevronsLeft,
  ChevronsRight,
  Gear,
  House,
  Persons,
  Receipt,
} from '@gravity-ui/icons';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export const SECTIONS: Array<{id: SectionId; title: string; icon: typeof House}> = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'users', title: 'Пользователи', icon: Persons},
  {id: 'orders', title: 'Заказы', icon: Receipt},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

interface SidebarProps {
  active: SectionId;
  collapsed: boolean;
  onNavigate: (id: SectionId) => void;
  onToggleCollapsed: () => void;
}

export function Sidebar({active, collapsed, onNavigate, onToggleCollapsed}: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`}>
      <div className="sidebar__logo">
        <div className="sidebar__logo-mark">A</div>
        {!collapsed && (
          <Text variant="subheader-2" className="sidebar__logo-text">
            Админка
          </Text>
        )}
      </div>

      <nav className="sidebar__nav">
        {SECTIONS.map(({id, title, icon}) => {
          const isActive = id === active;
          const button = (
            <button
              key={id}
              type="button"
              className={`sidebar__item${isActive ? ' sidebar__item_active' : ''}`}
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon data={icon} size={18} />
              {!collapsed && <span className="sidebar__item-label">{title}</span>}
            </button>
          );
          return collapsed ? (
            <Tooltip key={id} content={title} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <Tooltip
          content={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          placement="right"
        >
          <Button view="flat" size="l" onClick={onToggleCollapsed} className="sidebar__toggle">
            <Button.Icon>
              <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} />
            </Button.Icon>
            {!collapsed && 'Свернуть'}
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
}
