import * as React from 'react';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function readInitialTheme(): AppTheme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (privacy mode); fall through to system preference
  }
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/** Theme state persisted in localStorage; initial value follows the OS preference. */
export function useStoredTheme(): [AppTheme, (theme: AppTheme) => void] {
  const [theme, setTheme] = React.useState<AppTheme>(readInitialTheme);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore write errors
    }
  }, [theme]);

  return [theme, setTheme];
}
