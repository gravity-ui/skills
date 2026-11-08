import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

const BENEFITS = [
  {
    title: 'Учёт в один клик',
    text: 'Запускайте таймер на задаче и забудьте о таблицах — время записывается само.',
  },
  {
    title: 'Прозрачность для команды',
    text: 'Видно, сколько часов уходит на проекты и кто чем занят, без лишних созвонов.',
  },
  {
    title: 'Готовые отчёты',
    text: 'Сводки по людям, проектам и неделям — для планирования и счетов клиентам.',
  },
];

export function App() {
  return (
    <Flex
      as="main"
      direction="column"
      alignItems="center"
      gap="10"
      style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}
    >
      <Flex as="section" direction="column" alignItems="center" gap="4" style={{ textAlign: 'center' }}>
        <Text as="h1" variant="display-3">
          Учёт времени для команд без лишней рутины
        </Text>
        <Text as="p" variant="body-3" color="secondary" style={{ maxWidth: 560 }}>
          Простой инструмент, который показывает, куда уходит время команды, — и помогает
          планировать реалистичнее.
        </Text>
      </Flex>

      <Flex as="section" gap="4" wrap style={{ width: '100%' }}>
        {BENEFITS.map(({ title, text }) => (
          <Card
            key={title}
            type="container"
            view="outlined"
            style={{ flex: '1 1 240px', padding: 20 }}
          >
            <Flex direction="column" gap="2">
              <Text as="h2" variant="subheader-3">
                {title}
              </Text>
              <Text as="p" variant="body-2" color="secondary">
                {text}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Flex as="section" justifyContent="center">
        <Button view="action" size="xl" href="#">
          Попробовать бесплатно
        </Button>
      </Flex>
    </Flex>
  );
}
