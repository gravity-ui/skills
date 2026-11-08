import { Button, Card, Container, Flex, Text } from '@gravity-ui/uikit';

const SIGNUP_URL = '#signup';

const benefits = [
  {
    title: 'Один клик — и время пошло',
    text: 'Таймер запускается из браузера или мобильного приложения. Забыли включить — добавьте запись вручную задним числом.',
  },
  {
    title: 'Видно, куда уходят часы',
    text: 'Отчёты по проектам, клиентам и сотрудникам за любой период. Экспорт в CSV и PDF для счетов и планёрок.',
  },
  {
    title: 'Без микроменеджмента',
    text: 'Никаких скриншотов и слежки. Команда отмечает только то, над чем работает, а руководитель видит общую картину.',
  },
];

export function App() {
  return (
    <main>
      <Container maxWidth="l" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <Flex direction="column" gap="10">
          <Flex as="section" direction="column" gap="4" alignItems="flex-start" style={{ maxWidth: 640 }}>
            <Text as="h1" variant="display-3">
              Учёт времени команды без лишней бюрократии
            </Text>
            <Text as="p" variant="body-3" color="secondary">
              Фиксируйте часы по проектам, получайте понятные отчёты и выставляйте счета клиентам. Настройка
              занимает пять минут, а не неделю.
            </Text>
            <Button view="action" size="xl" href={SIGNUP_URL}>
              Попробовать бесплатно
            </Button>
          </Flex>

          <section
            aria-label="Преимущества"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {benefits.map((b) => (
              <Card key={b.title} view="filled" style={{ padding: 24 }}>
                <Flex direction="column" gap="2">
                  <Text as="h2" variant="subheader-3">
                    {b.title}
                  </Text>
                  <Text as="p" variant="body-2" color="secondary">
                    {b.text}
                  </Text>
                </Flex>
              </Card>
            ))}
          </section>

          <Flex as="section" direction="column" gap="4" alignItems="center" style={{ textAlign: 'center' }}>
            <Text as="h2" variant="header-2">
              Начните учитывать время уже сегодня
            </Text>
            <Text as="p" variant="body-2" color="secondary">
              14 дней бесплатно, без карты и обязательств.
            </Text>
            <Button view="action" size="xl" href={SIGNUP_URL}>
              Создать аккаунт
            </Button>
          </Flex>
        </Flex>
      </Container>
    </main>
  );
}
