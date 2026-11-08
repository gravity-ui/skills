import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

const SIGNUP_URL = '/signup';

const benefits = [
  {
    title: 'Учёт в один клик',
    text: 'Запускайте таймер прямо из задачи — без таблиц и ручного ввода в конце недели.',
  },
  {
    title: 'Прозрачная загрузка',
    text: 'Видно, сколько времени команда тратит на каждый проект и где часы уходят впустую.',
  },
  {
    title: 'Готовые отчёты',
    text: 'Отчёты для клиентов и выставления счетов собираются автоматически за секунды.',
  },
];

export function App() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '64px 24px' }}>
      <Flex direction="column" gap={4} alignItems="center" style={{ textAlign: 'center' }}>
        <Text variant="display-2" as="h1" style={{ margin: 0 }}>
          TeamClock — учёт времени для команд
        </Text>
        <Text variant="body-3" color="secondary" as="p" style={{ maxWidth: 600, margin: 0 }}>
          Простой способ понять, куда уходит рабочее время, и выставлять клиентам точные счета.
        </Text>
      </Flex>

      <Flex as="section" gap={4} wrap style={{ marginTop: 64 }}>
        {benefits.map((b) => (
          <Card key={b.title} view="outlined" style={{ flex: '1 1 240px', padding: 24 }}>
            <Flex direction="column" gap={2}>
              <Text variant="header-1" as="h2" style={{ margin: 0 }}>
                {b.title}
              </Text>
              <Text variant="body-2" color="secondary" as="p" style={{ margin: 0 }}>
                {b.text}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Flex as="section" direction="column" gap={4} alignItems="center" style={{ marginTop: 64 }}>
        <Text variant="header-2" as="h2" style={{ margin: 0 }}>
          Начните учитывать время уже сегодня
        </Text>
        <Button view="action" size="xl" href={SIGNUP_URL}>
          Попробовать бесплатно
        </Button>
      </Flex>
    </main>
  );
}
