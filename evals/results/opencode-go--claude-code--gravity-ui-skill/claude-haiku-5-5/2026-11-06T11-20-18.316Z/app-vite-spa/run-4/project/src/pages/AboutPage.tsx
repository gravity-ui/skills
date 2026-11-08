import { Box, Flex, Text } from '@gravity-ui/uikit';

const STACK = [
  '@gravity-ui/navigation — боковая навигация (AsideHeader) и нижний блок с переключателем темы',
  '@gravity-ui/uikit — кнопки, поля, карточки, чекбоксы и темизация через --g-* токены',
  '@gravity-ui/icons — иконки, передаются объектом в проп data',
  'React + Vite + TypeScript — без роутера: страницы выбираются по хешу в адресе',
];

export function AboutPage() {
  return (
    <Box spacing={{ p: 6 }}>
      <Flex direction="column" gap={4} style={{ maxWidth: 720 }}>
        <Text variant="header-1">О приложении</Text>
        <Text variant="body-2" color="secondary">
          Учебный пример: приложение из трёх страниц с навигацией и переключением светлой и тёмной
          темы. Все цвета берутся из семантических токенов Gravity UI, поэтому тема переключается
          без дополнительного CSS.
        </Text>
        <Flex direction="column" gap={2}>
          <Text variant="subheader-1">Стек</Text>
          {STACK.map((item) => (
            <Text key={item} variant="body-2">
              • {item}
            </Text>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}
