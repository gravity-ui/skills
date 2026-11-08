export type Theme = 'light' | 'dark';

const themeStorageKey = 'theme';

export function readStoredTheme(): Theme {
  try {
    const theme = localStorage.getItem(themeStorageKey);
    return theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {
    return;
  }
}
