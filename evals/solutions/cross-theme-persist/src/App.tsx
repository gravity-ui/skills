import { Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

const THEME_OPTIONS: Array<{ value: Theme; content: string }> = [
  { value: 'light', content: 'Светлая' },
  { value: 'dark', content: 'Тёмная' },
  { value: 'system', content: 'Системная' },
];

interface AppProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-1">Тема интерфейса</Text>
      <SegmentedRadioGroup
        value={theme}
        onUpdate={onThemeChange}
        aria-label="Переключатель темы"
        options={THEME_OPTIONS}
      />
      <Text color="secondary">
        Выбор сохраняется в localStorage и восстанавливается после перезагрузки страницы.
      </Text>
    </Flex>
  );
}
