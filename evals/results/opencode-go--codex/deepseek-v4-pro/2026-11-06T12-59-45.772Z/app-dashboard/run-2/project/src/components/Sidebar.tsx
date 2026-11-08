import { Icon, Button } from '@gravity-ui/uikit';
import HouseIcon from '@gravity-ui/icons/House';
import PersonsIcon from '@gravity-ui/icons/Persons';
import ShoppingCartIcon from '@gravity-ui/icons/ShoppingCart';
import GearIcon from '@gravity-ui/icons/Gear';
import ArrowLeftFromLineIcon from '@gravity-ui/icons/ArrowLeftFromLine';
import ArrowRightFromLineIcon from '@gravity-ui/icons/ArrowRightFromLine';
import { NAV_ITEMS } from '../data';

const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  House: HouseIcon,
  Users: PersonsIcon,
  ShoppingCart: ShoppingCartIcon,
  Gear: GearIcon,
};

interface SidebarProps {
  active: string;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate: (id: string) => void;
}

export function Sidebar({ active, collapsed, onToggle, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: collapsed ? 64 : 220,
        minWidth: collapsed ? 64 : 220,
        background: 'var(--g-color-base-background)',
        borderRight: '1px solid var(--g-color-line-generic)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo area */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? 0 : '0 16px',
          borderBottom: '1px solid var(--g-color-line-generic)',
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <span style={{ fontSize: 18, fontWeight: 600, whiteSpace: 'nowrap' }}>
            ⚡ Админка
          </span>
        )}
        <Button view="flat" size="m" onClick={onToggle}>
          <Icon
            data={collapsed ? ArrowRightFromLineIcon : ArrowLeftFromLineIcon}
            size={16}
          />
        </Button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV_ITEMS.map((item) => {
          const IconComponent = ICON_MAP[item.iconId];
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.title : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: collapsed ? '10px 0' : '10px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                border: 'none',
                background: isActive
                  ? 'var(--g-color-base-selection)'
                  : 'transparent',
                color: isActive
                  ? 'var(--g-color-text-brand)'
                  : 'var(--g-color-text-primary)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                transition: 'background 0.15s, color 0.15s',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background =
                    'var(--g-color-base-simple-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <IconComponent width={20} height={20} />
              {!collapsed && <span>{item.title}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--g-color-line-generic)',
            fontSize: 11,
            color: 'var(--g-color-text-secondary)',
          }}
        >
          v1.0.0
        </div>
      )}
    </aside>
  );
}
