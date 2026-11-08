import { Button, Card, Text } from '@gravity-ui/uikit';

const CTA_HREF = '#'; // TODO: подставить реальную ссылку на регистрацию

const features = [
  {
    title: 'Учёт в один клик',
    text: 'Запускайте таймер или добавляйте время вручную — без лишних полей и настроек.',
  },
  {
    title: 'Картина по всей команде',
    text: 'Видно, кто над чем работает и сколько времени уходит на каждый проект.',
  },
  {
    title: 'Отчёты без таблиц',
    text: 'Готовые сводки по людям и проектам — выгружайте или просто смотрите на экране.',
  },
];

const section: React.CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '64px 24px',
};

export function App() {
  return (
    <main>
      <header style={{ ...section, textAlign: 'center' }}>
        <Text as="h1" variant="display-3" style={{ margin: 0 }}>
          Учёт времени команды без лишней рутины
        </Text>
        <Text
          as="p"
          variant="body-3"
          color="secondary"
          style={{ maxWidth: 600, margin: '24px auto 32px' }}
        >
          Простой инструмент, который показывает, куда уходит рабочее время, и помогает планировать
          нагрузку точнее.
        </Text>
        <Button view="action" size="xl" href={CTA_HREF}>
          Попробовать бесплатно
        </Button>
      </header>

      <section
        style={{
          ...section,
          paddingTop: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {features.map(({ title, text }) => (
          <Card key={title} type="container" view="outlined" style={{ padding: 24 }}>
            <Text as="h2" variant="header-2" style={{ margin: 0 }}>
              {title}
            </Text>
            <Text as="p" variant="body-2" color="secondary" style={{ margin: '12px 0 0' }}>
              {text}
            </Text>
          </Card>
        ))}
      </section>

      <footer style={{ ...section, paddingTop: 0, textAlign: 'center' }}>
        <Text as="h2" variant="display-1" style={{ margin: '0 0 24px' }}>
          Начните считать время уже сегодня
        </Text>
        <Button view="action" size="xl" href={CTA_HREF}>
          Попробовать бесплатно
        </Button>
      </footer>
    </main>
  );
}
