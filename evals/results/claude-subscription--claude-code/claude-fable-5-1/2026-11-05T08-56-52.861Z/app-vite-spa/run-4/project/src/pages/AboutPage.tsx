import { DefinitionList, Flex, Text } from '@gravity-ui/uikit';

const STACK = [
  { name: 'UI', content: 'React 18 + Gravity UI' },
  { name: 'Сборка', content: 'Vite + TypeScript' },
  { name: 'Навигация', content: 'Хэш-роутер без внешних зависимостей (hashchange)' },
  { name: 'Тема', content: 'ThemeProvider из Gravity UI, выбор хранится в localStorage' },
];

export function AboutPage() {
  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="display-2" as="h1">
          О приложении
        </Text>
        <Text variant="body-2" color="secondary">
          Страницы переключаются через вкладки в шапке. Адрес страницы хранится в хэше URL,
          поэтому кнопки «назад» и «вперёд» в браузере работают как обычно.
        </Text>
      </Flex>

      <DefinitionList>
        {STACK.map((item) => (
          <DefinitionList.Item key={item.name} name={item.name}>
            {item.content}
          </DefinitionList.Item>
        ))}
      </DefinitionList>
    </Flex>
  );
}
