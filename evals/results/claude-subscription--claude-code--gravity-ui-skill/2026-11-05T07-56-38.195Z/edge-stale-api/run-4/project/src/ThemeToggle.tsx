import { Switch, useThemeType, type ThemeType } from '@gravity-ui/uikit';

export interface ThemeToggleProps {
  onThemeChange: (theme: ThemeType) => void;
}

/**
 * Переключатель светлой/тёмной темы.
 * Текущая тема читается из контекста ближайшего ThemeProvider (useThemeType),
 * а смена делегируется владельцу состояния — ThemeProvider в корне приложения.
 */
export function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
  const themeType = useThemeType();

  return (
    <Switch
      checked={themeType === 'dark'}
      onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      content="Тёмная тема"
    />
  );
}
