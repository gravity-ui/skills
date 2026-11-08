import { ChevronsLeft, ChevronsRight, Gear, House, Persons, ShoppingCart } from '@gravity-ui/icons';
import { Button, Icon, Text } from '@gravity-ui/uikit';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

type IconData = typeof House;

const SECTIONS: { id: SectionId; label: string; icon: IconData }[] = [
  { id: 'home', label: 'Главная', icon: House },
  { id: 'users', label: 'Пользователи', icon: Persons },
  { id: 'orders', label: 'Заказы', icon: ShoppingCart },
  { id: 'settings', label: 'Настройки', icon: Gear },
];

interface SidebarProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ active, onSelect, collapsed, onToggle }: SidebarProps) {
  const toggleLabel = collapsed ? 'Развернуть меню' : 'Свернуть меню';

  return (
    <aside className={collapsed ? 'sidebar is-collapsed' : 'sidebar'}>
      <div className="sidebar-header">
        {!collapsed && <Text variant="subheader-2">Админка</Text>}
        <Button
          view="flat"
          size="l"
          onClick={onToggle}
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          title={toggleLabel}
        >
          <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} />
        </Button>
      </div>

      <nav className="sidebar-nav" aria-label="Основная навигация">
        {SECTIONS.map((section) => {
          const isActive = section.id === active;
          return (
            <Button
              key={section.id}
              view="flat"
              size="l"
              width="max"
              selected={isActive}
              className="sidebar-item"
              aria-current={isActive ? 'page' : undefined}
              aria-label={collapsed ? section.label : undefined}
              title={collapsed ? section.label : undefined}
              onClick={() => onSelect(section.id)}
            >
              <Icon data={section.icon} size={18} />
              {!collapsed && <span className="sidebar-item-label">{section.label}</span>}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
