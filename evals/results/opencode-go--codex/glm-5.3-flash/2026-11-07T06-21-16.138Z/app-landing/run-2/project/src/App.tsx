import { Button, Container, Flex, Text } from '@gravity-ui/uikit';

const advantages = [
  {
    title: 'Точный учёт времени',
    description: 'Команда отмечает задачи в один клик, а руководитель видит реальные часы по проектам.',
  },
  {
    title: 'Наглядная отчётность',
    description: 'Готовые сводки показывают загрузку, сроки и распределение времени без ручных таблиц.',
  },
  {
    title: 'Простое внедрение',
    description: 'Инструмент стартует за минуты и не требует сложных настроек или обучения команды.',
  },
];

const styles = {
  hero: {
    padding: '96px 0 64px',
    borderBottom: '1px solid var(--g-color-line-generic)',
  },
  advantages: { padding: '64px 0' },
  cta: {
    padding: '64px 0 96px',
    borderTop: '1px solid var(--g-color-line-generic)',
  },
} as const;

export function App() {
  return (
    <main>
      <Container style={styles.hero}>
        <Flex direction="column" gap="5" style={{ maxWidth: 720 }}>
          <Text variant="display-2" as="h1">
            Учёт времени для небольших команд
          </Text>
          <Text variant="body-1" color="secondary" as="p">
            Отслеживайте часы, задачи и загрузку команды в одном простом инструменте.
          </Text>
          <Button size="xl" view="action" href="#start">
            Начать учёт времени
          </Button>
        </Flex>
      </Container>

      <Container style={styles.advantages}>
        <Flex gap="6" direction="column">
          {advantages.map((advantage) => (
            <Flex key={advantage.title} direction="column" gap="2">
              <Text variant="header-2" as="h2">
                {advantage.title}
              </Text>
              <Text variant="body-1" color="secondary" as="p">
                {advantage.description}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Container>

      <Container style={styles.cta}>
        <Flex id="start" direction="column" gap="4" alignItems="flex-start">
          <Text variant="header-2" as="h2">
            Попробуйте TimeLedger с командой
          </Text>
          <Button size="xl" view="action">
            Создать рабочее пространство
          </Button>
        </Flex>
      </Container>
    </main>
  );
}
