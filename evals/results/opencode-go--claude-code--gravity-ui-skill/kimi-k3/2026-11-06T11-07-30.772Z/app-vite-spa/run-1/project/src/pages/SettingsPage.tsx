import {Card, Flex, SegmentedRadioGroup, Text, useThemeValue} from '@gravity-ui/uikit';

import type {ThemeMode} from '../App';
import {Page} from '../components/Page';

const THEME_OPTIONS = [
  {value: 'light', content: 'Светлая'},
  {value: 'dark', content: 'Тёмная'},
  {value: 'system', content: 'Системная'},
];

export function SettingsPage({
  mode,
  onChangeMode,
}: {
  mode: ThemeMode;
  onChangeMode: (mode: ThemeMode) => void;
}) {
  const themeValue = useThemeValue();

  return (
    <Page title="Настройки">
      <Card type="container" view="outlined" size="l" spacing={{p: 5}}>
        <Flex direction="column" gap={4}>
          <Text variant="subheader-2">Тема оформления</Text>
          <SegmentedRadioGroup
            width="max"
            size="l"
            value={mode}
            options={THEME_OPTIONS}
            onUpdate={(value) => onChangeMode(value as ThemeMode)}
          />
          <Text variant="body-2" color="secondary">
            Сейчас применяется {themeValue === 'dark' ? 'тёмная' : 'светлая'} тема. В системном
            режиме приложение следует настройкам операционной системы.
          </Text>
        </Flex>
      </Card>

      <Text variant="caption-2" color="hint">
        Быстро переключить тему можно кнопкой со значком солнца/луны в нижней части бокового меню.
      </Text>
    </Page>
  );
}
