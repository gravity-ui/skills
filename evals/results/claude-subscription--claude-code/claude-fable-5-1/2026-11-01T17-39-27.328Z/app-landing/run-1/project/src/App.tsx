import { Button, Card, Container, Flex, Text } from '@gravity-ui/uikit';

const SIGNUP_URL = '/signup';

const BENEFITS = [
  {
    title: 'Учёт в один клик',
    text: 'Таймер запускается из любого проекта или задачи. Забытые записи можно добавить вручную задним числом.',
  },
  {
    title: 'Вся команда на одном экране',
    text: 'Кто над чем работает и сколько часов уже потрачено по каждому проекту — видно без отчётов и созвонов.',
  },
  {
    title: 'Отчёты для клиентов и зарплат',
    text: 'Экспорт по проектам, людям и периодам в CSV и PDF. Данные готовы для счетов и расчёта оплаты.',
  },
];

export function App() {
  return (
    <main>
      <Container maxWidth="m" spaceRow="10" style={{ paddingTop: 64, paddingBottom: 64 }}>
        {/* Hero */}
        <Flex direction="column" alignItems="center" gap="4" style={{ textAlign: 'center' }}>
          <Text as="h1" variant="display-3" style={{ margin: 0 }}>
            Учёт времени команды без лишней бюрократии
          </Text>
          <Text as="p" variant="body-3" color="secondary" style={{ margin: 0, maxWidth: 560 }}>
            Отмечайте время, следите за загрузкой людей и выгружайте отчёты для клиентов.
            Настройка занимает пять минут.
          </Text>
        </Flex>

        {/* Benefits */}
        <section aria-label="Преимущества">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
              marginTop: 48,
            }}
          >
            {BENEFITS.map((item) => (
              <Card key={item.title} view="filled" size="l">
                <Flex direction="column" gap="2">
                  <Text as="h2" variant="subheader-3" style={{ margin: 0 }}>
                    {item.title}
                  </Text>
                  <Text as="p" variant="body-2" color="secondary" style={{ margin: 0 }}>
                    {item.text}
                  </Text>
                </Flex>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Flex direction="column" alignItems="center" gap="3" style={{ marginTop: 64, textAlign: 'center' }}>
          <Text as="h2" variant="header-2" style={{ margin: 0 }}>
            Начните считать время уже сегодня
          </Text>
          <Text as="p" variant="body-2" color="secondary" style={{ margin: 0 }}>
            Бесплатно для команд до пяти человек. Карта не нужна.
          </Text>
          <Button view="action" size="xl" href={SIGNUP_URL}>
            Попробовать бесплатно
          </Button>
        </Flex>
      </Container>
    </main>
  );
}
