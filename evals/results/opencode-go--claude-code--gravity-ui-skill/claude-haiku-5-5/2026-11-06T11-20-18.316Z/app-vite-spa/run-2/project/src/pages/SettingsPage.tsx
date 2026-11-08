import { Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import type { ThemeMode } from '../types';

interface SettingsPageProps {
  theme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  return (
    <Flex direction="column" gap={5}>
      <Text variant="header-1">Настройки</Text>

      <Flex direction="column" gap={2}>
        <Text variant="subheader-2">Тема оформления</Text>
        <SegmentedRadioGroup
          size="l"
          name="theme"
          value={theme}
          onUpdate={(value) => onThemeChange(value as ThemeMode)}
          options={[
            { value: 'light', content: 'Светлая' },
            { value: 'dark', content: 'Тёмная' },
          ]}
        />
        <Text variant="caption-2" color="secondary">
          Выбор сохраняется в браузере. Переключить тему также можно внизу боковой панели.
        </Text>
      </Flex>
    </Flex>
  );
}
