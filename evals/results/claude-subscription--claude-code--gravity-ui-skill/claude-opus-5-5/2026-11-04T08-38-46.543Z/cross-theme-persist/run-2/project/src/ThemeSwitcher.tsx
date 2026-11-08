import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useAppTheme } from './AppThemeProvider';
import { type AppTheme, isAppTheme } from './themeStorage';

const OPTIONS: { value: AppTheme; content: string }[] = [
  { value: 'system', content: 'Системная' },
  { value: 'light', content: 'Светлая' },
  { value: 'dark', content: 'Тёмная' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useAppTheme();

  return (
    <SegmentedRadioGroup<AppTheme>
      aria-label="Тема оформления"
      value={theme}
      onUpdate={(value) => {
        if (isAppTheme(value)) setTheme(value);
      }}
      options={OPTIONS}
    />
  );
}
