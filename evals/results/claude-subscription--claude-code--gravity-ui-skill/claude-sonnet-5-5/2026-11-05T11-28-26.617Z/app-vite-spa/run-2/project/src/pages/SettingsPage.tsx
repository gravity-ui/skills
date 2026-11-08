import {Card, Flex, Switch, Text} from '@gravity-ui/uikit';

import {useAppTheme} from '../theme';
import {Page} from './Page';

export function SettingsPage() {
  const {theme, setTheme} = useAppTheme();

  return (
    <Page title="Настройки" description="Внешний вид приложения.">
      <Card view="outlined" type="container" style={{padding: 'var(--g-spacing-5)'}}>
        <Flex direction="column" gap={3}>
          <Switch
            size="l"
            checked={theme === 'dark'}
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
          >
            Тёмная тема
          </Switch>
          <Text variant="body-2" color="secondary">
            Тему также можно переключить кнопкой внизу боковой панели.
          </Text>
        </Flex>
      </Card>
    </Page>
  );
}
