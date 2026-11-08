import { Box, Text, Switch } from '@gravity-ui/uikit';

export interface SettingsPageProps {
  isDark: boolean;
  onToggleTheme: (checked: boolean) => void;
}

export function SettingsPage({ isDark, onToggleTheme }: SettingsPageProps) {
  return (
    <Box spacing={{ p: 4 }}>
      <Text variant="header-1" as="h1">
        Settings
      </Text>
      <Box spacing={{ mt: 4 }}>
        <Switch checked={isDark} onChange={(e) => onToggleTheme(e.target.checked)} content="Dark theme" size="l" />
      </Box>
    </Box>
  );
}
