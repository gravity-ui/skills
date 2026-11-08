import React from 'react';
import { Icon } from '@gravity-ui/uikit';
import {
  House,
  Person,
  Receipt,
  Gear,
  ArrowChevronLeft,
  ArrowChevronRight,
} from '@gravity-ui/icons';

interface NavItem {
  id: string;
  label: string;
  icon: { data: typeof House };
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Главная', icon: { data: House } },
  { id: 'users', label: 'Пользователи', icon: { data: Person } },
  { id: 'orders', label: 'Заказы', icon: { data: Receipt } },
  { id: 'settings', label: 'Настройки', icon: { data: Gear } },
];

interface SidebarProps {
  collapsed: boolean;
  activeSection: string;
  onToggle: () => void;
  onNavigate: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  activeSection,
  onToggle,
  onNavigate,
}) => {
  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: sidebarWidth,
        background: 'var(--g-color-base-background)',
        borderRight: '1px solid var(--g-color-line-generic)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid var(--g-color-line-generic)',
          gap: 12,
        }}
      >
        {!collapsed && (
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            Админка
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--g-color-text-secondary)',
            borderRadius: 6,
            flexShrink: 0,
            marginLeft: collapsed ? 'auto' : undefined,
            marginRight: collapsed ? 'auto' : undefined,
          }}
        >
          <Icon
            data={collapsed ? ArrowChevronRight : ArrowChevronLeft}
            size={20}
          />
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '12px 0' : '10px 20px',
                border: 'none',
                background: isActive
                  ? 'var(--g-color-base-selection)'
                  : 'transparent',
                color: isActive
                  ? 'var(--g-color-text-brand)'
                  : 'var(--g-color-text-primary)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'background 0.15s, color 0.15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.target as HTMLButtonElement).style.background =
                    'var(--g-color-base-simple-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.target as HTMLButtonElement).style.background =
                    'transparent';
              }}
            >
              <Icon data={item.icon.data} size={20} />
              {!collapsed && (
                <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--g-color-line-generic)',
            fontSize: 12,
            color: 'var(--g-color-text-secondary)',
          }}
        >
          v1.0.0
        </div>
      )}
    </div>
  );
};
