import {Box, Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import type {AppTheme} from './themeStorage';

interface AppProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export function App({theme, onThemeChange}: AppProps) {
  return (
    <Box spacing={{p: 6}}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">Переключатель темы</Text>
        <SegmentedRadioGroup<AppTheme>
          value={theme}
          onUpdate={onThemeChange}
          options={[
            {value: 'light', content: 'Светлая'},
            {value: 'dark', content: 'Тёмная'},
          ]}
        />
        <Text variant="body-2" color="secondary">
          Выбор сохраняется в localStorage и восстанавливается после перезагрузки страницы.
        </Text>
      </Flex>
    </Box>
  );
}
