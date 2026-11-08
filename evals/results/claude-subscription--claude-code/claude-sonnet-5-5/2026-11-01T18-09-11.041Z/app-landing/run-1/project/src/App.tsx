import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

const BENEFITS = [
  {
    title: 'Учёт без рутины',
    text: 'Запускайте таймер в один клик — время по задачам и проектам копится само.',
  },
  {
    title: 'Прозрачность для команды',
    text: 'Видно, на что уходят часы: кто чем занят и где проект выбивается из плана.',
  },
  {
    title: 'Готовые отчёты',
    text: 'Часы по людям, проектам и клиентам — для планирования и счетов без таблиц.',
  },
];

export function App() {
  return (
    <Flex
      direction="column"
      alignItems="center"
      gap={10}
      style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}
    >
      <Flex direction="column" alignItems="center" gap={4} style={{ textAlign: 'center' }}>
        <Text as="h1" variant="display-2">
          Учёт времени для команд без лишней бюрократии
        </Text>
        <Text as="p" variant="body-3" color="secondary" style={{ maxWidth: 600 }}>
          TeamClock помогает понять, на что уходит время команды, — и планировать
          работу на основе данных, а не догадок.
        </Text>
      </Flex>

      <Flex gap={4} wrap style={{ width: '100%' }}>
        {BENEFITS.map(({ title, text }) => (
          <Card key={title} type="container" view="outlined" style={{ flex: '1 1 240px', padding: 24 }}>
            <Flex direction="column" gap={2}>
              <Text as="h2" variant="subheader-3">
                {title}
              </Text>
              <Text as="p" color="secondary">
                {text}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Button size="xl" view="action" href="#start">
        Попробовать бесплатно
      </Button>
    </Flex>
  );
}
