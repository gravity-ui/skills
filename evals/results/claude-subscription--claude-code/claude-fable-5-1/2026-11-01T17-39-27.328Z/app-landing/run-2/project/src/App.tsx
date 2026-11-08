import { Button, Card, Container, Flex, Text } from '@gravity-ui/uikit';

const benefits = [
  {
    title: 'Учёт в один клик',
    text: 'Таймер запускается из любой задачи. Ничего не нужно заполнять вручную — время само привязывается к проекту.',
  },
  {
    title: 'Прозрачная команда',
    text: 'Руководитель видит загрузку каждого сотрудника за день и неделю без лишних созвонов и отчётов.',
  },
  {
    title: 'Отчёты для клиентов',
    text: 'Экспорт в CSV и PDF по проекту или клиенту. Выставляйте счета на основе реальных часов.',
  },
];

export function App() {
  return (
    <Container maxWidth="m" style={{ padding: '64px 16px' }}>
      <Flex direction="column" gap={10} as="main">
        <Flex direction="column" gap={4} alignItems="center" as="section" style={{ textAlign: 'center' }}>
          <Text as="h1" variant="display-3">
            Учёт времени команды без лишней бюрократии
          </Text>
          <Text as="p" variant="body-3" color="secondary" style={{ maxWidth: 560 }}>
            Трекер, который сотрудники не забывают включать. Запускайте таймер, следите за загрузкой и
            закрывайте проекты в срок.
          </Text>
          <Button view="action" size="xl" href="#start">
            Попробовать бесплатно
          </Button>
        </Flex>

        <Flex gap={4} wrap as="section">
          {benefits.map((b) => (
            <Card key={b.title} view="outlined" style={{ flex: '1 1 240px', padding: 24 }}>
              <Flex direction="column" gap={2}>
                <Text as="h2" variant="subheader-3">
                  {b.title}
                </Text>
                <Text as="p" variant="body-2" color="secondary">
                  {b.text}
                </Text>
              </Flex>
            </Card>
          ))}
        </Flex>

        <Flex direction="column" gap={4} alignItems="center" as="section" id="start" style={{ textAlign: 'center' }}>
          <Text as="h2" variant="header-2">
            Начните учитывать время уже сегодня
          </Text>
          <Text as="p" variant="body-2" color="secondary">
            Бесплатно для команд до 5 человек. Без карты.
          </Text>
          <Button view="action" size="xl" href="#start">
            Создать аккаунт
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
}
