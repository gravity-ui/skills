import { Card, Flex, SegmentedRadioGroup, Switch, Text } from '@gravity-ui/uikit';

import type { AppTheme } from '../theme';
import { PageHeader } from './PageHeader';

type Props = {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  compact: boolean;
  onCompactChange: (compact: boolean) => void;
};

export function SettingsPage({ theme, onThemeChange, compact, onCompactChange }: Props) {
  return (
    <Flex direction="column" gap={6}>
      <PageHeader title="Настройки" description="Внешний вид приложения." />

      <Card view="outlined" spacing={{ p: 4 }}>
        <Flex direction="column" gap={5}>
          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">Тема оформления</Text>
            <SegmentedRadioGroup<AppTheme>
              value={theme}
              onUpdate={onThemeChange}
              aria-label="Тема оформления"
            >
              <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
              <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            </SegmentedRadioGroup>
          </Flex>

          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">Боковое меню</Text>
            <Switch checked={compact} onUpdate={onCompactChange} content="Компактный режим" />
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
