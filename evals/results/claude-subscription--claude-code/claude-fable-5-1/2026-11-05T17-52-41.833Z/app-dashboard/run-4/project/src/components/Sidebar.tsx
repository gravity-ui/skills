import { ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart } from '@gravity-ui/icons';
import { Avatar, Button, Icon, Text, Tooltip } from '@gravity-ui/uikit';
import './Sidebar.css';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export interface NavItem {
  id: SectionId;
  title: string;
  icon: typeof House;
  badge?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'users', title: 'Пользователи', icon: Persons },
  { id: 'orders', title: 'Заказы', icon: ShoppingCart },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

interface SidebarProps {
  active: SectionId;
  collapsed: boolean;
  badges?: Partial<Record<SectionId, number>>;
  onNavigate: (id: SectionId) => void;
  onToggleCollapsed: () => void;
}

export function Sidebar({ active, collapsed, badges, onNavigate, onToggleCollapsed }: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`} aria-label="Основная навигация">
      <div className="sidebar__brand">
        <div className="sidebar__logo" aria-hidden>
          A
        </div>
        {!collapsed && (
          <Text variant="subheader-2" ellipsis className="sidebar__brand-title">
            Админка
          </Text>
        )}
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__list" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active;
            const badge = badges?.[item.id];
            const button = (
              <button
                type="button"
                className={`sidebar__item${isActive ? ' sidebar__item_active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={collapsed ? item.title : undefined}
                onClick={() => onNavigate(item.id)}
              >
                <span className="sidebar__item-icon">
                  <Icon data={item.icon} size={18} />
                  {collapsed && badge ? <span className="sidebar__dot" aria-hidden /> : null}
                </span>
                {!collapsed && (
                  <>
                    <span className="sidebar__item-title">{item.title}</span>
                    {badge ? <span className="sidebar__badge">{badge}</span> : null}
                  </>
                )}
              </button>
            );
            return (
              <li key={item.id}>
                {collapsed ? (
                  <Tooltip content={item.title} placement="right">
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
        <div className="sidebar__user">
          <Avatar text="Ирина К." theme="brand" size="s" />
          {!collapsed && (
            <div className="sidebar__user-info">
              <Text variant="body-1" ellipsis>
                Ирина Ковалёва
              </Text>
              <Text variant="caption-2" color="secondary" ellipsis>
                Администратор
              </Text>
            </div>
          )}
        </div>
        <Button
          view="flat"
          size="m"
          width={collapsed ? undefined : 'max'}
          className="sidebar__toggle"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          aria-expanded={!collapsed}
        >
          <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={16} />
          {!collapsed && 'Свернуть'}
        </Button>
      </div>
    </aside>
  );
}
