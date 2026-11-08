import { useEffect, useState } from 'react';
import {
  Card,
  Switch,
  Text,
  ThemeProvider,
  useThemeType,
  type Theme,
} from '@gravity-ui/uikit';

function ThemeToggle() {
  const themeType = useThemeType();
  const isDark = themeType === 'dark';

  const handleUpdate = (checked: boolean) => {
    const nextTheme: Theme = checked ? 'dark' : 'light';
    window.dispatchEvent(new CustomEvent<Theme>('gravity:theme-change', { detail: nextTheme }));
  };

  return <Switch checked={isDark} onUpdate={handleUpdate} content="Тёмная тема" />;
}

export function App() {
  const [theme, setTheme] = useState<Theme>('light');

  const themeType = theme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      setTheme((event as CustomEvent<Theme>).detail === 'dark' ? 'dark' : 'light');
    };

    window.addEventListener('gravity:theme-change', handleThemeChange);
    return () => window.removeEventListener('gravity:theme-change', handleThemeChange);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div style={{ minHeight: '100vh', padding: 24 }}>
        <Card theme="normal" style={{ maxWidth: 560, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
            <div>
              <Text variant="header-1" as="h1">
                Настройки интерфейса
              </Text>
              <Text variant="body-1" color="secondary">
                Выберите тему оформления
              </Text>
            </div>
            <ThemeToggle />
          </div>
          <Text variant="body-2" color="secondary">
            Сейчас используется {themeType === 'dark' ? 'тёмная' : 'светлая'} тема.
          </Text>
        </Card>
      </div>
    </ThemeProvider>
  );
}
