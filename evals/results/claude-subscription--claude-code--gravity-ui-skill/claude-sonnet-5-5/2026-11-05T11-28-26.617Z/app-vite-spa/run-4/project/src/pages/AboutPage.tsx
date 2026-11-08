import {Card, Flex, Switch, Text} from '@gravity-ui/uikit';

import {useThemeMode} from '../theme';
import {Page} from './Page';

const STACK = ['React 18', 'Vite', 'TypeScript', '@gravity-ui/uikit', '@gravity-ui/navigation', 'React Router'];

export function AboutPage() {
  const {mode, setMode} = useThemeMode();

  return (
    <Page title="О приложении" description="Стек и настройки оформления.">
      <Card type="container" view="outlined" style={{padding: 'var(--g-spacing-4)'}}>
        <Flex direction="column" gap={3}>
          <Text variant="subheader-2">Оформление</Text>
          <Switch
            checked={mode === 'dark'}
            onUpdate={(checked) => setMode(checked ? 'dark' : 'light')}
            content="Тёмная тема"
          />
        </Flex>
      </Card>

      <Card type="container" view="outlined" style={{padding: 'var(--g-spacing-4)'}}>
        <Flex direction="column" gap={2}>
          <Text variant="subheader-2">Технологии</Text>
          {STACK.map((item) => (
            <Text key={item} variant="body-1">
              • {item}
            </Text>
          ))}
        </Flex>
      </Card>
    </Page>
  );
}
