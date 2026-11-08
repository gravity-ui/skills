import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

const BENEFITS = [
  {
    title: 'Учёт в один клик',
    text: 'Запускайте таймер прямо из задачи — без ручного заполнения таблиц в конце недели.',
  },
  {
    title: 'Вся команда на виду',
    text: 'Смотрите, сколько времени уходит на каждый проект и кто сейчас перегружен.',
  },
  {
    title: 'Отчёты для клиентов',
    text: 'Выгружайте понятные отчёты по часам и проектам, готовые для счетов и планирования.',
  },
];

const sectionStyle = { maxWidth: 960, margin: '0 auto', padding: '64px 24px' };

export function App() {
  return (
    <main>
      <section style={sectionStyle}>
        <Flex direction="column" alignItems="center" gap={4} style={{ textAlign: 'center' }}>
          <Text variant="display-2" as="h1" style={{ margin: 0 }}>
            Учёт времени команды без лишней рутины
          </Text>
          <Text variant="body-3" color="secondary" as="p" style={{ margin: 0, maxWidth: 640 }}>
            Ритм помогает небольшим командам видеть, куда уходят часы, и точнее планировать
            проекты.
          </Text>
        </Flex>
      </section>

      <section style={{ ...sectionStyle, paddingTop: 0 }}>
        <Flex wrap gap={4}>
          {BENEFITS.map((benefit) => (
            <Card
              key={benefit.title}
              view="outlined"
              style={{ flex: '1 1 260px', padding: 24 }}
            >
              <Flex direction="column" gap={2}>
                <Text variant="subheader-3" as="h2" style={{ margin: 0 }}>
                  {benefit.title}
                </Text>
                <Text variant="body-2" color="secondary" as="p" style={{ margin: 0 }}>
                  {benefit.text}
                </Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      </section>

      <section style={{ ...sectionStyle, paddingTop: 0 }}>
        <Flex direction="column" alignItems="center" gap={4} style={{ textAlign: 'center' }}>
          <Text variant="header-2" as="h2" style={{ margin: 0 }}>
            Попробуйте Ритм бесплатно 14 дней
          </Text>
          <Button view="action" size="xl" href="/signup">
            Начать бесплатно
          </Button>
        </Flex>
      </section>
    </main>
  );
}
