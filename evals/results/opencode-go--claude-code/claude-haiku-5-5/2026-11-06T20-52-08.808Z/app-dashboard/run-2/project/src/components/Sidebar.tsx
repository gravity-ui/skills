import { Bars, Gear, House, Person, Receipt } from '@gravity-ui/icons';
import { Icon, type IconData } from '@gravity-ui/uikit';
import './Sidebar.css';

export type SectionId = 'home' | 'users' | 'orders' | 'settings';

export const SECTIONS: Array<{ id: SectionId; label: string; icon: IconData }> = [
  { id: 'home', label: 'Главная', icon: House },
  { id: 'users', label: 'Пользователи', icon: Person },
  { id: 'orders', label: 'Заказы', icon: Receipt },
  { id: 'settings', label: 'Настройки', icon: Gear },
];

interface SidebarProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ active, onSelect, collapsed, onToggleCollapsed }: SidebarProps) {
  return (
    <aside className={`sidebar${collapsed ? ' is-collapsed' : ''}`} aria-label="Основная навигация">
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls="sidebar-nav"
          aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
          title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        >
          <Icon data={Bars} size={18} />
        </button>
        {!collapsed && <span className="sidebar-brand">Админка</span>}
      </div>

      <nav id="sidebar-nav">
        <ul className="sidebar-list">
          {SECTIONS.map((section) => (
            <NavItem
              key={section.id}
              label={section.label}
              icon={section.icon}
              current={section.id === active}
              collapsed={collapsed}
              onClick={() => onSelect(section.id)}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function NavItem({
  label,
  icon,
  current,
  collapsed,
  onClick,
}: {
  label: string;
  icon: IconData;
  current: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={`sidebar-item${current ? ' is-current' : ''}`}
        onClick={onClick}
        aria-current={current ? 'page' : undefined}
        aria-label={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
      >
        <Icon data={icon} size={18} />
        {!collapsed && <span className="sidebar-item-label">{label}</span>}
      </button>
    </li>
  );
}
