import {useState} from 'react';
import {ThemeProvider, useThemeValue} from '@gravity-ui/uikit';
import {AsideHeader, FooterItem, type AsideHeaderItem} from '@gravity-ui/navigation';
import {CircleInfo, Gear, House, Moon, Rocket, Sun} from '@gravity-ui/icons';

import {AboutPage} from './pages/AboutPage';
import {HomePage} from './pages/HomePage';
import {SettingsPage} from './pages/SettingsPage';

export type ThemeMode = 'light' | 'dark' | 'system';

type PageId = 'home' | 'about' | 'settings';

const MENU_ITEMS: Array<{id: PageId; title: string; icon: AsideHeaderItem['icon']}> = [
  {id: 'home', title: 'Главная', icon: House},
  {id: 'about', title: 'О приложении', icon: CircleInfo},
  {id: 'settings', title: 'Настройки', icon: Gear},
];

function ThemeToggleFooterItem({
  compact,
  onChangeMode,
}: {
  compact: boolean;
  onChangeMode: (mode: ThemeMode) => void;
}) {
  const themeValue = useThemeValue();
  const isDark = themeValue === 'dark';
  const title = isDark ? 'Светлая тема' : 'Тёмная тема';

  return (
    <FooterItem
      id="theme-toggle"
      compact={compact}
      icon={isDark ? Sun : Moon}
      title={title}
      tooltipText={title}
      onItemClick={() => onChangeMode(isDark ? 'light' : 'dark')}
    />
  );
}

export function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [page, setPage] = useState<PageId>('home');
  const [compact, setCompact] = useState(false);

  return (
    <ThemeProvider theme={themeMode} lang="ru">
      <AsideHeader
        logo={{
          text: 'Gravity Demo',
          icon: Rocket,
          onClick: () => setPage('home'),
        }}
        compact={compact}
        onChangeCompact={setCompact}
        collapseTitle="Свернуть"
        expandTitle="Развернуть"
        menuMoreTitle="Ещё"
        menuItems={MENU_ITEMS.map((item) => ({
          ...item,
          current: page === item.id,
          onItemClick: () => setPage(item.id),
        }))}
        renderFooter={({compact: footerCompact}) => (
          <ThemeToggleFooterItem compact={footerCompact} onChangeMode={setThemeMode} />
        )}
        renderContent={() => {
          switch (page) {
            case 'about':
              return <AboutPage />;
            case 'settings':
              return <SettingsPage mode={themeMode} onChangeMode={setThemeMode} />;
            default:
              return <HomePage onOpenSettings={() => setPage('settings')} />;
          }
        }}
      />
    </ThemeProvider>
  );
}
