import { Card, Flex, SegmentedRadioGroup, Text, useThemeType } from '@gravity-ui/uikit';

import type { AppTheme } from '../useAppTheme';

interface SettingsPageProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  const resolved = useThemeType();

  return (
    <Flex direction="column" gap={6}>
      <Text variant="header-1" as="h1">
        Настройки
      </Text>

      <Card view="outlined" className="app-panel">
        <Flex direction="column" gap={3} alignItems="flex-start">
          <Flex direction="column" gap={1}>
            <Text variant="subheader-2">Тема оформления</Text>
            <Text color="secondary">
              «Системная» следует настройке ОС. Сейчас активна{' '}
              {resolved === 'dark' ? 'тёмная' : 'светлая'} тема.
            </Text>
          </Flex>
          <SegmentedRadioGroup<AppTheme>
            size="l"
            value={theme}
            onUpdate={onThemeChange}
            aria-label="Тема оформления"
          >
            <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
          </SegmentedRadioGroup>
        </Flex>
      </Card>
    </Flex>
  );
}
