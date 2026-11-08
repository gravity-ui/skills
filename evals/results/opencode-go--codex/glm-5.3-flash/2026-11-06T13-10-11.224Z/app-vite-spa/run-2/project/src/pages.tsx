import { Card, Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';
import { useThemeState } from './theme';

export function HomePage() {
  return (
    <Card view="filled">
      <Flex direction="column" gap="4">
        <Text variant="header-2">Мини-приложение</Text>
        <Text color="secondary" variant="body-2">
          Это первая страница. Переключайтесь между разделами, чтобы посмотреть базовую навигацию.
        </Text>
      </Flex>
    </Card>
  );
}

export function AboutPage() {
  return (
    <Card view="filled">
      <Flex direction="column" gap="4">
        <Text variant="header-2">О приложении</Text>
        <Text color="secondary" variant="body-2">
          Приложение построено на React и Vite. Страницы меняются без перезагрузки, а тема сохраняется в браузере.
        </Text>
      </Flex>
    </Card>
  );
}

export function SettingsPage() {
  const { theme, toggleTheme } = useThemeState();

  return (
    <Card view="filled">
      <Flex direction="column" gap="4">
        <Text variant="header-2">Настройки</Text>
        <Text color="secondary" variant="body-2">Выберите оформление интерфейса.</Text>
        <SegmentedRadioGroup onChange={toggleTheme} value={theme}>
          <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </Flex>
    </Card>
  );
}
