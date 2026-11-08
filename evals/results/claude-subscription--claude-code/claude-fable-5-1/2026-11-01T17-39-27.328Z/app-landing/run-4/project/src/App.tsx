import { Button, Card, Container, Flex, Text } from '@gravity-ui/uikit';

const SIGNUP_URL = '#signup';

const BENEFITS = [
  {
    title: 'Один клик на старт',
    text: 'Таймер запускается из любой задачи. Никаких таблиц и ручного ввода в конце дня.',
  },
  {
    title: 'Вся команда на виду',
    text: 'Кто чем занят и сколько часов ушло на проект — в одном отчёте за минуту.',
  },
  {
    title: 'Счета без споров',
    text: 'Экспорт учтённого времени по клиенту или проекту в CSV для выставления счёта.',
  },
];

export function App() {
  return (
    <Container maxWidth="l" style={{ padding: '64px 24px 96px' }}>
      <Flex direction="column" gap={10}>
        <Flex as="section" direction="column" alignItems="center" gap={4} style={{ textAlign: 'center' }}>
          <Text variant="display-2" as="h1">
            Учёт времени команды без лишней бюрократии
          </Text>
          <Text variant="body-3" color="secondary" style={{ maxWidth: 560 }}>
            Таймтрек — простой инструмент для небольших команд: фиксируйте часы по проектам
            и получайте понятные отчёты для клиентов и руководителя.
          </Text>
        </Flex>

        <Flex as="section" gap={4} wrap>
          {BENEFITS.map((benefit) => (
            <Card key={benefit.title} view="outlined" size="l" style={{ flex: '1 1 240px' }}>
              <Flex direction="column" gap={2}>
                <Text variant="subheader-2" as="h2">
                  {benefit.title}
                </Text>
                <Text variant="body-2" color="secondary">
                  {benefit.text}
                </Text>
              </Flex>
            </Card>
          ))}
        </Flex>

        <Flex as="section" direction="column" alignItems="center" gap={3} style={{ textAlign: 'center' }}>
          <Text variant="header-2" as="h2">
            Начните считать время уже сегодня
          </Text>
          <Text variant="body-2" color="secondary">
            Бесплатно для команд до 5 человек. Без карты и настройки.
          </Text>
          <Button view="action" size="xl" href={SIGNUP_URL}>
            Создать аккаунт
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
}
