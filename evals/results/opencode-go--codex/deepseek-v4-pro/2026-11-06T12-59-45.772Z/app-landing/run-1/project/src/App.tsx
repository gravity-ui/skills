import { Button, Card, Text } from '@gravity-ui/uikit';

const wrapper: React.CSSProperties = {
  maxWidth: 900,
  margin: '0 auto',
  padding: '40px 24px',
};

const hero: React.CSSProperties = {
  textAlign: 'center',
  padding: '80px 0',
};

const heroSubtitle: React.CSSProperties = {
  marginTop: 16,
  marginBottom: 32,
  maxWidth: 520,
  marginLeft: 'auto',
  marginRight: 'auto',
  color: 'var(--g-color-text-secondary)',
};

const benefits: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 24,
  marginTop: 64,
};

const card: React.CSSProperties = {
  padding: 32,
  textAlign: 'center',
};

const icon: React.CSSProperties = {
  fontSize: 40,
  marginBottom: 16,
};

const cardBody: React.CSSProperties = {
  marginTop: 8,
  color: 'var(--g-color-text-secondary)',
};

const cta: React.CSSProperties = {
  textAlign: 'center',
  padding: '80px 0',
  marginTop: 64,
};

const ctaBody: React.CSSProperties = {
  marginTop: 12,
  marginBottom: 32,
  color: 'var(--g-color-text-secondary)',
};

const BENEFITS = [
  {
    title: 'Мгновенный старт',
    body: 'Запустите учёт времени за 5 минут. Никакого обучения — интерфейс понятен с первого взгляда.',
    icon: '🚀',
  },
  {
    title: 'Прозрачная аналитика',
    body: 'Отчёты по проектам, задачам и сотрудникам формируются в реальном времени. Всегда знайте, куда уходит время.',
    icon: '📊',
  },
  {
    title: 'Готовые интеграции',
    body: 'Подключите Slack, Jira, GitHub и другие инструменты одним кликом — без разработчиков.',
    icon: '🔌',
  },
];

export function App() {
  return (
    <main style={wrapper}>
      {/* Hero */}
      <section style={hero}>
        <Text variant="display-2" as="h1">
          Учёт времени команды
          <br />
          без лишних усилий
        </Text>
        <div style={heroSubtitle}>
          <Text variant="body-2">
            Простой SaaS-инструмент для отслеживания рабочего времени.
            Прозрачно, быстро и без бюрократии.
          </Text>
        </div>
        <Button view="action" size="l">
          Начать бесплатно
        </Button>
      </section>

      {/* Benefits */}
      <section style={benefits}>
        {BENEFITS.map((b) => (
          <Card key={b.title} style={card}>
            <div style={icon}>{b.icon}</div>
            <Text variant="subheader-2">{b.title}</Text>
            <div style={cardBody}>
              <Text variant="body-2">{b.body}</Text>
            </div>
          </Card>
        ))}
      </section>

      {/* CTA */}
      <section style={cta}>
        <Text variant="display-1">Готовы навести порядок?</Text>
        <div style={ctaBody}>
          <Text variant="body-2">Подключите команду и получите первую неделю бесплатно.</Text>
        </div>
        <Button view="action" size="l">Попробовать бесплатно</Button>
      </section>
    </main>
  );
}
