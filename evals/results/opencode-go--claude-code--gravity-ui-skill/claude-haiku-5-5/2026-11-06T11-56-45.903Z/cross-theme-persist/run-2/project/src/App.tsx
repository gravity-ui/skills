import { Box, Flex, Select, Text } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

import { THEME_OPTIONS, isTheme } from './theme';

interface AppProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <Box spacing={{ p: 6 }}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">Настройки</Text>
        <Select
          width={280}
          label="Тема оформления"
          value={[theme]}
          options={THEME_OPTIONS.map((option) => ({
            value: option.value,
            content: option.label,
          }))}
          onUpdate={([next]) => {
            if (isTheme(next)) {
              onThemeChange(next);
            }
          }}
        />
      </Flex>
    </Box>
  );
}
