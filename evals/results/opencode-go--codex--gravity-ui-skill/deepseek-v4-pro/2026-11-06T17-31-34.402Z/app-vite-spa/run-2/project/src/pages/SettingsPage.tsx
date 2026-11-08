import {Card, Flex, Text, Switch, Icon} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';
import {Sun, Moon} from '@gravity-ui/icons';

interface SettingsPageProps {
  theme: Theme;
}

export function SettingsPage({theme}: SettingsPageProps) {
  const isDark = theme === 'dark';

  return (
    <Flex direction="column" gap={4}>
      <Text variant="subheader-1">Settings</Text>

      <Card type="container" view="raised" size="l">
        <Flex direction="column" gap={4}>
          <Text variant="subheader-2">Appearance</Text>

          <Flex direction="column" gap={3}>
            {/* Current theme info */}
            <Card type="container" view="filled" theme="info" size="m">
              <Flex alignItems="center" gap={3}>
                <Icon
                  data={isDark ? Moon : Sun}
                  size={20}
                  color={isDark ? 'info' : 'warning'}
                />
                <Text variant="body-1">
                  Current theme:{' '}
                  <Text variant="body-1" color={isDark ? 'info' : 'warning'}>
                    {isDark ? 'Dark' : 'Light'}
                  </Text>
                </Text>
              </Flex>
            </Card>

            <Flex
              alignItems="center"
              justifyContent="space-between"
              style={{
                padding: 'var(--g-spacing-3) 0',
                borderBottom: '1px solid var(--g-color-line-generic)',
              }}
            >
              <Flex alignItems="center" gap={2}>
                <Icon data={Sun} size={16} color={isDark ? 'hint' : 'brand'} />
                <Text variant="body-1">Light mode</Text>
              </Flex>
              <Text variant="body-1" color={isDark ? 'hint' : 'brand'}>
                {isDark ? 'Off' : 'On'}
              </Text>
            </Flex>

            <Flex
              alignItems="center"
              justifyContent="space-between"
              style={{
                padding: 'var(--g-spacing-3) 0',
                borderBottom: '1px solid var(--g-color-line-generic)',
              }}
            >
              <Flex alignItems="center" gap={2}>
                <Icon data={Moon} size={16} color={isDark ? 'brand' : 'hint'} />
                <Text variant="body-1">Dark mode</Text>
              </Flex>
              <Text variant="body-1" color={isDark ? 'brand' : 'hint'}>
                {isDark ? 'On' : 'Off'}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Card>

      <Card type="container" view="raised" size="l">
        <Flex direction="column" gap={3}>
          <Text variant="subheader-2">About this demo</Text>
          <Text variant="body-1" color="secondary">
            Built with @gravity-ui/uikit v7.43.0, React 18, and Vite. The theme
            is managed via ThemeProvider and toggled by a Switch component in
            the header.
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
