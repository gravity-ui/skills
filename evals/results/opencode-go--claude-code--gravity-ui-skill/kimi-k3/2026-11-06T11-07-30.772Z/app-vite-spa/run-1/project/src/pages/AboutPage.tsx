import {Card, Flex, Text} from '@gravity-ui/uikit';

import {Page} from '../components/Page';

const STACK = [
  {name: '@gravity-ui/uikit', description: 'базовые компоненты, типографика и темизация'},
  {name: '@gravity-ui/navigation', description: 'каркас приложения — боковое меню AsideHeader'},
  {name: '@gravity-ui/icons', description: 'SVG-иконки для меню и страниц'},
];

export function AboutPage() {
  return (
    <Page title="О приложении">
      <Text variant="body-1" color="secondary">
        Приложение собрано на экосистеме Gravity UI. Навигация между страницами выполнена через
        пункты меню AsideHeader, а переключение темы — через ThemeProvider от @gravity-ui/uikit.
      </Text>

      <Card type="container" view="filled" size="l" spacing={{p: 5}}>
        <Flex direction="column" gap={4}>
          <Text variant="subheader-2">Что внутри</Text>
          <Flex direction="column" gap={3}>
            {STACK.map((item) => (
              <Flex key={item.name} direction="column" gap={1}>
                <Text variant="code-1">{item.name}</Text>
                <Text variant="body-2" color="secondary">
                  {item.description}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Card>

      <Text variant="caption-2" color="hint">
        Сверните боковое меню кнопкой в его нижней части — навигация продолжит работать в
        компактном виде.
      </Text>
    </Page>
  );
}
