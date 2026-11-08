import { Flex, Icon, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';
import { Moon, Sun } from '@gravity-ui/icons';
import type { AppTheme } from '../theme';

interface SettingsPageProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="display-2" as="h1">
          Настройки
        </Text>
        <Text variant="body-2" color="secondary">
          Тот же переключатель, что и в шапке: состояние темы общее для всего приложения.
        </Text>
      </Flex>

      <Flex direction="column" gap={2}>
        <Text variant="subheader-2" as="label" id="theme-label">
          Тема оформления
        </Text>
        <SegmentedRadioGroup<AppTheme>
          value={theme}
          onUpdate={onThemeChange}
          size="l"
          aria-labelledby="theme-label"
        >
          <SegmentedRadioGroup.Option value="light">
            <Flex alignItems="center" gap={1}>
              <Icon data={Sun} size={16} /> Светлая
            </Flex>
          </SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="dark">
            <Flex alignItems="center" gap={1}>
              <Icon data={Moon} size={16} /> Тёмная
            </Flex>
          </SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </Flex>
    </Flex>
  );
}
