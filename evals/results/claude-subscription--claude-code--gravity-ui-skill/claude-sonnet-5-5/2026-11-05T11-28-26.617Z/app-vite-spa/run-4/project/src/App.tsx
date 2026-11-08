import React from 'react';
import {Gear, House, Layers, Moon, Sun} from '@gravity-ui/icons';
import {AsideHeader, FooterItem} from '@gravity-ui/navigation';
import {Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';

import {AboutPage} from './pages/AboutPage';
import {FeaturesPage} from './pages/FeaturesPage';
import {HomePage} from './pages/HomePage';
import {useThemeMode} from './theme';

const NAV = [
  {id: 'home', path: '/', title: 'Главная', icon: House},
  {id: 'features', path: '/features', title: 'Возможности', icon: Layers},
  {id: 'about', path: '/about', title: 'О приложении', icon: Gear},
];

export function App() {
  const [compact, setCompact] = React.useState(false);
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {mode, toggle} = useThemeMode();

  const menuItems = NAV.map(({id, path, title, icon}) => ({
    id,
    title,
    icon,
    current: pathname === path,
    onItemClick: () => navigate(path),
  }));

  return (
    <AsideHeader
      logo={{text: 'Gravity App', icon: House, iconSize: 24, onClick: () => navigate('/')}}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderFooter={({compact: isCompact}) => (
        <FooterItem
          id="theme-toggle"
          title={mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          icon={mode === 'dark' ? Sun : Moon}
          compact={isCompact}
          onItemClick={toggle}
        />
      )}
      renderContent={() => (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    />
  );
}
