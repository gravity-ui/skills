import { Button, Card, Container, Flex, Text } from '@gravity-ui/uikit';

const SIGNUP_URL = '#'; // TODO: подставить реальную ссылку на регистрацию

const BENEFITS = [
  {
    title: 'Учёт в один клик',
    text: 'Запускайте таймер на задаче и забудьте о нём. Никаких таблиц и ручного заполнения в конце недели.',
  },
  {
    title: 'Понятная картина по команде',
    text: 'Видно, сколько времени уходит на проекты и клиентов, — без опросов и уточняющих сообщений.',
  },
  {
    title: 'Честные оценки и планы',
    text: 'Реальные данные о затраченных часах помогают точнее оценивать сроки и распределять нагрузку.',
  },
];

export function App() {
  return (
    <main>
      <Container maxWidth="l">
        <Flex direction="column" gap={10} style={{ padding: '80px 0' }}>
          <Flex direction="column" gap={4} alignItems="center" style={{ textAlign: 'center' }}>
            <Text as="h1" variant="display-2">
              Учёт времени команды без лишней рутины
            </Text>
            <Text as="p" variant="body-3" color="secondary" style={{ maxWidth: 640 }}>
              Простой инструмент, который показывает, на что уходит рабочее время, — чтобы команда
              планировала спокойнее, а руководитель видел реальную картину.
            </Text>
          </Flex>

          <Flex gap={4} wrap>
            {BENEFITS.map(({ title, text }) => (
              <Card
                key={title}
                view="outlined"
                type="container"
                style={{ flex: '1 1 260px', padding: 24 }}
              >
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

          <Flex direction="column" gap={4} alignItems="center" style={{ textAlign: 'center' }}>
            <Text as="p" variant="header-2">
              Начните считать время уже сегодня
            </Text>
            <Button view="action" size="xl" href={SIGNUP_URL}>
              Попробовать бесплатно
            </Button>
          </Flex>
        </Flex>
      </Container>
    </main>
  );
}
