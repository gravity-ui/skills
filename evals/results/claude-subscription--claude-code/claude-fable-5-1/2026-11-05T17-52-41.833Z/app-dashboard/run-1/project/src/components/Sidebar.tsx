import { Button, Icon, Text, Tooltip } from '@gravity-ui/uikit';
import { ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart } from '@gravity-ui/icons';
import type { IconData } from '@gravity-ui/uikit';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export const SECTIONS: Array<{ id: SectionId; title: string; icon: IconData }> = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'users', title: 'Пользователи', icon: Persons },
  { id: 'orders', title: 'Заказы', icon: ShoppingCart },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

interface SidebarProps {
  active: SectionId;
  collapsed: boolean;
  onSelect: (id: SectionId) => void;
  onToggle: () => void;
}

export function Sidebar({ active, collapsed, onSelect, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' sidebar_collapsed' : ''}`} aria-label="Основная навигация">
      <div className="sidebar__logo">
        <span className="sidebar__logo-mark" aria-hidden="true">
          A
        </span>
        {!collapsed && (
          <Text variant="subheader-2" ellipsis>
            Админка
          </Text>
        )}
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__list" role="list">
          {SECTIONS.map((section) => {
            const isActive = section.id === active;
            const item = (
              <button
                type="button"
                className={`sidebar__item${isActive ? ' sidebar__item_active' : ''}`}
                onClick={() => onSelect(section.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={collapsed ? section.title : undefined}
              >
                <Icon data={section.icon} size={18} />
                {!collapsed && <span className="sidebar__item-title">{section.title}</span>}
              </button>
            );
            return (
              <li key={section.id}>
                {collapsed ? (
                  <Tooltip content={section.title} placement="right" openDelay={200}>
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
        <Tooltip content={collapsed ? 'Развернуть меню' : 'Свернуть меню'} placement="right" openDelay={200}>
          <Button
            view="flat"
            size="l"
            width={collapsed ? 'auto' : 'max'}
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={16} />
            {!collapsed && 'Свернуть'}
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
}
