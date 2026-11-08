import { useState, useCallback } from 'react';
import { Button } from '@gravity-ui/uikit';
import House from '@gravity-ui/icons/House';
import Person from '@gravity-ui/icons/Person';
import ShoppingCart from '@gravity-ui/icons/ShoppingCart';
import Gear from '@gravity-ui/icons/Gear';
import ChevronsCollapseVertical from '@gravity-ui/icons/ChevronsCollapseVertical';
import ChevronsExpandVertical from '@gravity-ui/icons/ChevronsExpandVertical';

import { navItems } from './data';

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  House,
  Person,
  ShoppingCart,
  Gear,
};

interface SidebarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

function SvgIcon({
  cmp: Cmp,
  size = 16,
}: {
  cmp: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: number;
}) {
  return <Cmp width={size} height={size} />;
}

export function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => {
    setCollapsed((v) => !v);
  }, []);

  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <div
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        backgroundColor: 'var(--g-color-base-background)',
        borderRight: '1px solid var(--g-color-line-generic)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header / brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--g-color-line-generic)',
          minHeight: 48,
        }}
      >
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>
            Админка
          </span>
        )}
        <Button view="flat" size="m" onClick={toggleCollapse}>
          <SvgIcon
            cmp={collapsed ? ChevronsExpandVertical : ChevronsCollapseVertical}
            size={16}
          />
        </Button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map((item) => {
          const IconCmp = ICON_MAP[item.icon];
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: collapsed ? '10px 0' : '10px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                border: 'none',
                background: isActive
                  ? 'var(--g-color-base-selection)'
                  : 'transparent',
                color: isActive
                  ? 'var(--g-color-text-primary)'
                  : 'var(--g-color-text-secondary)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'background 0.15s, color 0.15s',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'var(--g-color-base-simple-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'transparent';
              }}
            >
              <SvgIcon cmp={IconCmp} size={18} />
              {!collapsed && (
                <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
