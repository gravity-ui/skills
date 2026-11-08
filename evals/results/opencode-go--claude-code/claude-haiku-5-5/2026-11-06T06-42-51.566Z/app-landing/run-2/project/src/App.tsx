import { Button, Card, Container, Text } from '@gravity-ui/uikit';

const ADVANTAGES = [
  {
    title: 'Учёт в один клик',
    text: 'Запускайте таймер прямо из задачи или добавляйте время задним числом. Никаких таблиц и ручного переноса данных.',
  },
  {
    title: 'Видно загрузку команды',
    text: 'Сразу понятно, кто перегружен, кто свободен и какие проекты приближаются к бюджету по часам.',
  },
  {
    title: 'Отчёты без ручной работы',
    text: 'Сводка по проекту или клиенту за любой период готова для согласования и выставления счёта.',
  },
];

const sectionStyle = { padding: '64px 0' };

export function App() {
  return (
    <main>
      <section style={{ ...sectionStyle, paddingTop: 96 }}>
        <Container maxWidth="l">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}>
            <Text as="h1" variant="display-3">
              Учёт времени команды без таблиц и ручных отчётов
            </Text>
            <Text as="p" variant="subheader-3" color="secondary">
              Записывайте время по задачам, видите загрузку каждого участника и выгружайте отчёты
              для клиентов и бухгалтерии.
            </Text>
          </div>
        </Container>
      </section>

      <section style={sectionStyle}>
        <Container maxWidth="l">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 24,
            }}
          >
            {ADVANTAGES.map((item) => (
              <Card key={item.title} type="container" view="outlined" size="l">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Text as="h2" variant="subheader-3">
                    {item.title}
                  </Text>
                  <Text as="p" variant="body-2" color="secondary">
                    {item.text}
                  </Text>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section style={{ ...sectionStyle, paddingBottom: 96 }}>
        <Container maxWidth="l">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 24,
              maxWidth: 720,
            }}
          >
            <Text as="h2" variant="display-2">
              Попробуйте на своей команде
            </Text>
            <Text as="p" variant="body-3" color="secondary">
              Подключите команду и посмотрите, куда на самом деле уходит время.
            </Text>
            <Button view="action" size="xl">
              Начать работу
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
