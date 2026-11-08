import { Button, Card, Text, useThemeValue } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';

export function App() {
  const themeValue = useThemeValue();

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <Text variant="header-1">Тема оформления</Text>
      <ThemeSwitcher />
      <Card view="filled" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Text>
          Активная тема: <Text variant="code-1">{themeValue}</Text>
        </Text>
        <Text color="secondary">
          Выбор сохраняется в localStorage и восстанавливается после перезагрузки страницы.
        </Text>
        <div>
          <Button view="action">Пример кнопки</Button>
        </div>
      </Card>
    </div>
  );
}
