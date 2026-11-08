import {
  Button,
  SegmentedRadioGroup,
  Text,
  ThemeProvider,
} from '@gravity-ui/uikit';

import './styles.css';
import {ROUTES, ROUTE_TITLES, useHashRoute, type Route} from './router';
import {useTheme} from './theme';
import {AboutPage} from './pages/AboutPage';
import {HomePage} from './pages/HomePage';
import {SettingsPage} from './pages/SettingsPage';

export function App() {
  const [theme, setTheme] = useTheme();
  const [route, navigate] = useHashRoute();

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <header className="app__header">
          <Text variant="subheader-3" className="app__logo">
            ✨ Мини-приложение
          </Text>

          <nav className="app__nav" aria-label="Основная навигация">
            <SegmentedRadioGroup
              value={route}
              onUpdate={(value) => navigate(value as Route)}
            >
              {ROUTES.map((r) => (
                <SegmentedRadioGroup.Option key={r} value={r}>
                  {ROUTE_TITLES[r]}
                </SegmentedRadioGroup.Option>
              ))}
            </SegmentedRadioGroup>
          </nav>

          <Button
            view="outlined"
            className="app__theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            {theme === 'dark' ? '☀️ Светлая' : '🌙 Тёмная'}
          </Button>
        </header>

        <main className="app__content">
          {route === 'home' && <HomePage onNavigate={navigate} />}
          {route === 'about' && <AboutPage />}
          {route === 'settings' && <SettingsPage theme={theme} onThemeChange={setTheme} />}
        </main>

        <footer className="app__footer">
          <Text variant="body-1" color="secondary">
            React + Gravity UI · текущая страница: {ROUTE_TITLES[route]}
          </Text>
        </footer>
      </div>
    </ThemeProvider>
  );
}
