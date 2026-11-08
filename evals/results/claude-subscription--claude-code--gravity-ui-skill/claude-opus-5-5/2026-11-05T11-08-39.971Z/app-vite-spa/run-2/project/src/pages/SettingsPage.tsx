import { Card, Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { ThemeSetting, useThemeSetting } from '../theme';
import { PageContainer } from './PageContainer';

const THEME_OPTIONS: { value: ThemeSetting; content: string }[] = [
  { value: 'light', content: 'Светлая' },
  { value: 'dark', content: 'Тёмная' },
  { value: 'system', content: 'Как в системе' },
];

export function SettingsPage() {
  const { theme, setTheme } = useThemeSetting();

  return (
    <PageContainer title="Настройки" description="Параметры внешнего вида приложения.">
      <Card view="outlined">
        <Flex direction="column" gap={3} style={{ padding: 'var(--g-spacing-5)' }}>
          <Flex direction="column" gap={1}>
            <Text variant="subheader-2">Тема оформления</Text>
            <Text variant="body-1" color="secondary">
              Выбор сохраняется в браузере и применяется ко всему приложению.
            </Text>
          </Flex>
          <SegmentedRadioGroup<ThemeSetting>
            value={theme}
            onUpdate={setTheme}
            options={THEME_OPTIONS}
            aria-label="Тема оформления"
            style={{ alignSelf: 'flex-start', maxWidth: '100%' }}
          />
        </Flex>
      </Card>
    </PageContainer>
  );
}
