import { Button, Card, Container, Flex, Text } from '@gravity-ui/uikit';

export function App() {
  return (
    <main>
      {/* Hero */}
      <section style={{ padding: '96px 0 64px', textAlign: 'center' }}>
        <Container maxWidth="l">
          <Flex direction="column" alignItems="center" gap="5">
            <Text variant="display-3">Учёт времени для команд</Text>
            <Text
              variant="body-2"
              color="secondary"
              style={{ maxWidth: 520 }}
            >
              Простой инструмент отслеживания рабочих часов. Планируйте задачи,
              фиксируйте время и получайте понятную аналитику — без лишнего шума.
            </Text>
            <Button view="action" size="l">
              Попробовать бесплатно
            </Button>
          </Flex>
        </Container>
      </section>

      {/* Three benefits */}
      <section style={{ padding: '80px 0' }}>
        <Container maxWidth="l">
          <Flex gap="6" justifyContent="center">
            <Card view="raised" size="l" style={{ flex: '0 1 280px', padding: 32, textAlign: 'center' }}>
              <Flex direction="column" alignItems="center" gap="3">
                <Text variant="subheader-2">Точный трекинг</Text>
                <Text variant="body-1" color="secondary">
                  Фиксируйте часы по проектам и задачам в один клик. Ничего не
                  потеряется.
                </Text>
              </Flex>
            </Card>

            <Card view="raised" size="l" style={{ flex: '0 1 280px', padding: 32, textAlign: 'center' }}>
              <Flex direction="column" alignItems="center" gap="3">
                <Text variant="subheader-2">Командная прозрачность</Text>
                <Text variant="body-1" color="secondary">
                  Видите, над чем работает каждый участник. Никаких догадок и
                  лишних созвонов.
                </Text>
              </Flex>
            </Card>

            <Card view="raised" size="l" style={{ flex: '0 1 280px', padding: 32, textAlign: 'center' }}>
              <Flex direction="column" alignItems="center" gap="3">
                <Text variant="subheader-2">Готовые отчёты</Text>
                <Text variant="body-1" color="secondary">
                  Выгружайте сводки для клиентов и руководства. CSV или PDF за
                  пару секунд.
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Container>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 0 96px', textAlign: 'center' }}>
        <Container maxWidth="l">
          <Flex direction="column" alignItems="center" gap="4">
            <Text variant="header-1">Начните уже сегодня</Text>
            <Text variant="body-2" color="secondary">
              Первые 14 дней бесплатно. Без карты и обязательств.
            </Text>
            <Button view="action" size="l">
              Попробовать бесплатно
            </Button>
          </Flex>
        </Container>
      </section>
    </main>
  );
}
