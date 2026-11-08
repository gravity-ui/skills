import {Box, Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {useThemeSwitcher} from './Root';
import type {StoredTheme} from './theme-storage';

const THEME_OPTIONS: {value: StoredTheme; content: string}[] = [
  {value: 'light', content: 'Светлая'},
  {value: 'dark', content: 'Тёмная'},
];

export function App() {
  const {theme, setTheme} = useThemeSwitcher();

  return (
    <Box
      spacing={{p: 6}}
      style={{minHeight: '100vh', background: 'var(--g-color-base-background)'}}
    >
      <Flex direction="column" gap={4}>
        <Text variant="header-2">Переключатель темы</Text>
        <SegmentedRadioGroup
          aria-label="Тема оформления"
          value={theme}
          onUpdate={setTheme}
          options={THEME_OPTIONS}
        />
        <Text variant="body-2" color="secondary">
          Выбранная тема сохраняется в localStorage и восстанавливается после перезагрузки
          страницы.
        </Text>
      </Flex>
    </Box>
  );
}
