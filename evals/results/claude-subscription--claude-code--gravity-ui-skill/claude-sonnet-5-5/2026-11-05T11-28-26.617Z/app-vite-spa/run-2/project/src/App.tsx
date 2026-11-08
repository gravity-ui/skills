import React from 'react';
import {Gear, House, Moon, Sun, Layers3Diagonal} from '@gravity-ui/icons';
import {AsideHeader, FooterItem} from '@gravity-ui/navigation';
import type {MenuItem} from '@gravity-ui/navigation';
import {Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';

import {FeaturesPage} from './pages/FeaturesPage';
import {HomePage} from './pages/HomePage';
import {SettingsPage} from './pages/SettingsPage';
import {useAppTheme} from './theme';

const NAV = [
  {id: 'home', path: '/', title: 'Главная', icon: House},
  {id: 'features', path: '/features', title: 'Возможности', icon: Layers3Diagonal},
  {id: 'settings', path: '/settings', title: 'Настройки', icon: Gear},
] as const;

export function App() {
  const [compact, setCompact] = React.useState(false);
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {theme, toggleTheme} = useAppTheme();

  const menuItems: MenuItem[] = NAV.map((item) => ({
    id: item.id,
    title: item.title,
    icon: item.icon,
    href: item.path,
    current: pathname === item.path,
    onItemClick: (_item, _collapsed, event) => {
      event.preventDefault();
      navigate(item.path);
    },
  }));

  return (
    <AsideHeader
      logo={{
        text: 'Gravity App',
        icon: Layers3Diagonal,
        href: '/',
        onClick: (event) => {
          event.preventDefault();
          navigate('/');
        },
      }}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderFooter={({compact: footerCompact}) => (
        <FooterItem
          id="theme-toggle"
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          tooltipText="Переключить тему"
          icon={theme === 'dark' ? Sun : Moon}
          compact={footerCompact}
          onItemClick={toggleTheme}
        />
      )}
      renderContent={() => (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    />
  );
}
