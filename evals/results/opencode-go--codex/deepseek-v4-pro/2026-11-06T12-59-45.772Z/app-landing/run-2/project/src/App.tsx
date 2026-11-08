import { Container, Flex, Text, Button, Card } from '@gravity-ui/uikit';

function App() {
  return (
    <Container maxWidth="l" style={{ padding: '0 24px' }}>
      <Flex direction="column" gap={10}>
        {/* ── Hero ── */}
        <Flex
          direction="column"
          alignItems="center"
          gap={4}
          style={{ paddingTop: 120, paddingBottom: 80, textAlign: 'center' }}
        >
          <Text variant="display-3" color="primary">
            Учёт времени, который не мешает работать
          </Text>
          <Text variant="body-2" color="secondary" style={{ maxWidth: 520 }}>
            TeamClock помогает вам и вашей команде понимать, куда уходят часы, —
            без лишних форм, таймеров и отвлечений.
          </Text>
          <Button view="action" size="l" style={{ marginTop: 8 }}>
            Начать бесплатно
          </Button>
        </Flex>

        {/* ── Три преимущества ── */}
        <Flex gap={4} style={{ paddingBottom: 80 }}>
          <Card type="container" view="filled" size="l" style={{ flex: 1 }}>
            <Flex direction="column" gap={2} style={{ padding: 32 }}>
              <Text variant="subheader-2">Трекер на заднем плане</Text>
              <Text variant="body-2" color="secondary">
                Автоматически записывает активность по приложениям и сайтам — вам
                не нужно ничего нажимать.
              </Text>
            </Flex>
          </Card>
          <Card type="container" view="filled" size="l" style={{ flex: 1 }}>
            <Flex direction="column" gap={2} style={{ padding: 32 }}>
              <Text variant="subheader-2">Понятные отчёты</Text>
              <Text variant="body-2" color="secondary">
                Сводки по проектам, клиентам и сотрудникам собираются сами —
                делитесь ими за пару кликов.
              </Text>
            </Flex>
          </Card>
          <Card type="container" view="filled" size="l" style={{ flex: 1 }}>
            <Flex direction="column" gap={2} style={{ padding: 32 }}>
              <Text variant="subheader-2">Конфиденциальность по умолчанию</Text>
              <Text variant="body-2" color="secondary">
                Все данные хранятся в зашифрованном виде, а каждый сотрудник
                видит только свою статистику.
              </Text>
            </Flex>
          </Card>
        </Flex>

        {/* ── Нижний CTA ── */}
        <Flex
          direction="column"
          alignItems="center"
          gap={4}
          style={{
            paddingTop: 80,
            paddingBottom: 120,
            textAlign: 'center',
            borderTop: '1px solid var(--g-color-line-generic)',
          }}
        >
          <Text variant="display-1">Начните учитывать время уже сегодня</Text>
          <Text variant="body-2" color="secondary" style={{ maxWidth: 480 }}>
            Бесплатный период на 14 дней — без ограничений и без привязки
            карты.
          </Text>
          <Button view="action" size="l" style={{ marginTop: 8 }}>
            Попробовать TeamClock
          </Button>
        </Flex>
      </Flex>
    </Container>
  );
}

export { App };
