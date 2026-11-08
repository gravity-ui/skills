import { Button, Card, Flex, Text, useThemeValue } from '@gravity-ui/uikit';

import { ThemeSwitcher, useAppTheme } from './theme';

export function App() {
  const themeValue = useThemeValue();
  const { theme, setTheme } = useAppTheme();

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Flex alignItems="center" justifyContent="space-between" gap={4}>
        <Text variant="header-1">Gravity UI</Text>
        <ThemeSwitcher />
      </Flex>

      <Card view="filled" style={{ padding: 16 }}>
        <Flex direction="column" gap={2}>
          <Text variant="subheader-2">Текущая тема</Text>
          <Text>
            Выбрано: <Text color="brand">{theme}</Text>, применено: <Text color="brand">{themeValue}</Text>
          </Text>
          {theme !== 'system' && (
            <div>
              <Button view="outlined" size="s" onClick={() => setTheme('system')}>
                Как в системе
              </Button>
            </div>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}
