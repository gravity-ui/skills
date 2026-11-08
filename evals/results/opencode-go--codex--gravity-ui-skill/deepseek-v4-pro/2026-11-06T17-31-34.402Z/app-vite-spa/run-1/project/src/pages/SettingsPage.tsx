import { Card, Flex, Switch, Text } from '@gravity-ui/uikit';
import type { RealTheme } from '@gravity-ui/uikit';

export interface SettingsPageProps {
  theme: RealTheme;
  onToggleTheme: () => void;
}

export function SettingsPage({ theme, onToggleTheme }: SettingsPageProps) {
  return (
    <Flex direction="column" gap={4}>
      <Text variant="header-1">Settings</Text>
      <Card type="container" view="outlined" size="l">
        <Flex direction="column" gap={3}>
          <Text variant="subheader-1">Appearance</Text>
          <Flex gap={3} alignItems="center">
            <Text>Dark mode</Text>
            <Switch
              checked={theme === 'dark' || theme === 'dark-hc'}
              onUpdate={onToggleTheme}
            />
          </Flex>
          <Text color="secondary">
            Current theme: <strong>{theme}</strong>
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
