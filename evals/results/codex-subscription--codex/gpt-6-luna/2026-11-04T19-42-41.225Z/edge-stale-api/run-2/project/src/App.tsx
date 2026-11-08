import {useState} from 'react';
import {Switch, ThemeProvider} from '@gravity-ui/uikit';

type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

function getInitialTheme(): AppTheme {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);
  const isDark = theme === 'dark';

  const handleThemeUpdate = (checked: boolean) => {
    const nextTheme: AppTheme = checked ? 'dark' : 'light';
    setTheme(nextTheme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The theme still works for this session when storage is unavailable.
    }
  };

  return (
    <ThemeProvider theme={theme} scoped>
      <main
        style={{
          boxSizing: 'border-box',
          minHeight: '100vh',
          padding: 'clamp(24px, 6vw, 72px) 24px',
          backgroundColor: 'var(--g-color-base-background)',
          color: 'var(--g-color-text-primary)',
          transition: 'background-color 180ms ease, color 180ms ease',
        }}
      >
        <section
          style={{
            width: 'min(100%, 560px)',
            margin: '0 auto',
          }}
        >
          <p
            style={{
              margin: '0 0 12px',
              color: 'var(--g-color-text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Внешний вид
          </p>
          <h1 style={{margin: '0 0 32px', fontSize: 'clamp(30px, 5vw, 42px)', lineHeight: 1.15}}>
            Настройки темы
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              padding: 24,
              border: '1px solid var(--g-color-line-generic)',
              borderRadius: 16,
              backgroundColor: 'var(--g-color-base-float)',
            }}
          >
            <div>
              <div style={{marginBottom: 6, fontSize: 16, fontWeight: 600}}>
                Тёмная тема
              </div>
              <div style={{color: 'var(--g-color-text-secondary)', fontSize: 14}}>
                {isDark ? 'Включена' : 'Выключена'}
              </div>
            </div>
            <Switch
              size="l"
              checked={isDark}
              onUpdate={handleThemeUpdate}
              aria-label="Включить тёмную тему"
              title={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
            />
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
