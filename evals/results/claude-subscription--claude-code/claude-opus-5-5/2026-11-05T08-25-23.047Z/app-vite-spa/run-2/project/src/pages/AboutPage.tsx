import { Flex, Label, Text, useThemeValue } from '@gravity-ui/uikit';

export function AboutPage() {
  const theme = useThemeValue();

  return (
    <Flex direction="column" gap={6}>
      <Text as="h1" variant="display-1">
        О приложении
      </Text>

      <Flex direction="column" gap={3}>
        <Text variant="body-2">
          Интерфейс построен на React и компонентах Gravity UI. Цвета берутся из CSS-переменных
          темы, поэтому при переключении меняется весь интерфейс сразу — без перезагрузки.
        </Text>
        <Text variant="body-2">
          Навигация реализована через хэш в адресе (<code>#/tasks</code>, <code>#/about</code>):
          у каждой страницы своя ссылка, а кнопки «назад» и «вперёд» в браузере работают как
          обычно.
        </Text>
      </Flex>

      <Flex gap={2} alignItems="center">
        <Text color="secondary">Текущая тема:</Text>
        <Label theme={theme === 'dark' ? 'info' : 'warning'}>
          {theme === 'dark' ? 'тёмная' : 'светлая'}
        </Label>
      </Flex>
    </Flex>
  );
}
