import React from 'react';
import {Gear, House, Layers, Moon, Sun} from '@gravity-ui/icons';
import {AsideHeader, FooterItem} from '@gravity-ui/navigation';
import {Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';

import {HomePage} from './pages/HomePage';
import {FeaturesPage} from './pages/FeaturesPage';
import {SettingsPage} from './pages/SettingsPage';
import {useAppTheme} from './theme';

const NAV = [
  {id: 'home', path: '/', title: 'Главная', icon: House},
  {id: 'features', path: '/features', title: 'Возможности', icon: Layers},
  {id: 'settings', path: '/settings', title: 'Настройки', icon: Gear},
] as const;

export function App() {
  const [compact, setCompact] = React.useState(false);
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {theme, toggleTheme} = useAppTheme();

  const menuItems = NAV.map((item) => ({
    id: item.id,
    title: item.title,
    icon: item.icon,
    current: pathname === item.path,
    onItemClick: () => navigate(item.path),
  }));

  return (
    <AsideHeader
      logo={{text: 'Gravity App', icon: Layers, iconSize: 24, onClick: () => navigate('/')}}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderFooter={({compact: isCompact}) => (
        <FooterItem
          id="theme-toggle"
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          icon={theme === 'dark' ? Sun : Moon}
          compact={isCompact}
          onItemClick={toggleTheme}
        />
      )}
      renderContent={() => (
        <main style={{padding: 'var(--g-spacing-6)', maxWidth: 960}}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      )}
    />
  );
}
