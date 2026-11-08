import { Button, Icon } from '@gravity-ui/uikit';
import { ChevronsLeft, ChevronsRight } from '@gravity-ui/icons';
import type { NavSection, SectionId } from '../nav';

interface SidebarProps {
  sections: readonly NavSection[];
  activeId: SectionId;
  collapsed: boolean;
  onSelect: (id: SectionId) => void;
  onToggle: () => void;
}

export function Sidebar({ sections, activeId, collapsed, onSelect, onToggle }: SidebarProps) {
  const toggleLabel = collapsed ? 'Развернуть меню' : 'Свернуть меню';

  return (
    <aside className={collapsed ? 'sidebar is-collapsed' : 'sidebar'}>
      <div className="sidebar__header">
        {!collapsed && <span className="sidebar__brand">Админка</span>}
        <Button view="flat" size="l" onClick={onToggle} title={toggleLabel} aria-label={toggleLabel} aria-expanded={!collapsed}>
          <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} />
        </Button>
      </div>

      <nav aria-label="Основная навигация">
        <ul>
          {sections.map((section) => {
            const isActive = section.id === activeId;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  className="nav-item"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={collapsed ? section.label : undefined}
                  title={collapsed ? section.label : undefined}
                  onClick={() => onSelect(section.id)}
                >
                  <Icon data={section.icon} size={18} />
                  {!collapsed && <span>{section.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
