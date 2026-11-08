import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

import { ThemeChoiceContext, loadThemeChoice, saveThemeChoice, type ThemeChoice } from './theme';

/**
 * Корневой провайдер темы. Держит выбор пользователя, сохраняет его в localStorage
 * и передаёт в ThemeProvider. Должен стоять выше всего UI, т.к. ThemeProvider без parent
 * управляет классами <body>, а от них зависят фон страницы и порталы.
 */
export function ThemeRoot({ children }: { children: ReactNode }) {
  // Ленивая инициализация: тема читается из localStorage уже на первом рендере,
  // поэтому после перезагрузки не появляется промежуточная светлая тема.
  const [theme, setThemeState] = useState<ThemeChoice>(loadThemeChoice);

  const setTheme = useCallback((next: ThemeChoice) => {
    saveThemeChoice(next);
    setThemeState(next);
  }, []);

  const contextValue = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeChoiceContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeChoiceContext.Provider>
  );
}
