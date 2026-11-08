import { Card, Text, useThemeValue } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';
import { useAppTheme } from './theme';

export function App() {
  const { theme } = useAppTheme();
  const resolvedTheme = useThemeValue();

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <Text variant="header-1">Переключатель темы</Text>
      <ThemeSwitcher />
      <Card view="filled" style={{ padding: 16 }}>
        <Text as="div">
          Выбрано: <b>{theme}</b>
        </Text>
        <Text as="div" color="secondary">
          Применена: {resolvedTheme}
        </Text>
        <Text as="div" color="secondary">
          Выбор сохраняется в localStorage и восстанавливается после перезагрузки страницы.
        </Text>
      </Card>
    </div>
  );
}
