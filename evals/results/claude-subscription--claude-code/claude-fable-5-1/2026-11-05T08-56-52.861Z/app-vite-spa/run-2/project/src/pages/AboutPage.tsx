import { DefinitionList, Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <div className="page">
      <Text variant="display-2" as="h1">
        О приложении
      </Text>
      <Text variant="body-2" color="secondary" as="p">
        Как это устроено внутри.
      </Text>

      <DefinitionList>
        <DefinitionList.Item name="Интерфейс">React 18 + Gravity UI</DefinitionList.Item>
        <DefinitionList.Item name="Сборка">Vite + TypeScript</DefinitionList.Item>
        <DefinitionList.Item name="Навигация">
          Хэш-маршруты (#/, #/about, #/settings) без внешнего роутера
        </DefinitionList.Item>
        <DefinitionList.Item name="Тема">
          ThemeProvider из Gravity UI, выбор хранится в localStorage, по умолчанию берётся
          системная
        </DefinitionList.Item>
      </DefinitionList>
    </div>
  );
}
