import {useEffect, useState} from 'react';
import {Button, Text, ThemeProvider} from '@gravity-ui/uikit';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function getInitialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // localStorage недоступен (например, приватный режим) — используем тему по умолчанию
  }
  return 'light';
}

export function App() {
  // Ленивая инициализация: тема восстанавливается из localStorage при первой загрузке
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Сохраняем выбор при каждом переключении
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Игнорируем ошибки записи — переключатель продолжит работать без сохранения
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          minHeight: '100vh',
          padding: 24,
          background: 'var(--g-color-base-background)',
          color: 'var(--g-color-text-primary)',
          transition: 'background 0.2s ease, color 0.2s ease',
        }}
      >
        <Text variant="header-1" as="h1">
          Переключатель темы
        </Text>
        <div style={{marginTop: 16}}>
          <Button view="action" size="l" onClick={toggleTheme}>
            {theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
          </Button>
        </div>
        <div style={{marginTop: 16}}>
          <Text variant="body-2" color="secondary">
            Текущая тема: {theme === 'light' ? 'светлая' : 'тёмная'}. Выбор сохраняется в
            localStorage и восстановится после перезагрузки страницы.
          </Text>
        </div>
      </div>
    </ThemeProvider>
  );
}
