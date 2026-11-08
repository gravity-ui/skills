import {Button, Text} from '@gravity-ui/uikit';

const benefits = [
  {
    title: 'Учёт в один клик',
    text: 'Таймер запускается прямо из задачи — команда фиксирует время, не отвлекаясь от работы.',
  },
  {
    title: 'Прозрачные отчёты',
    text: 'Сводки по проектам и людям собираются автоматически: сколько часов ушло и куда.',
  },
  {
    title: 'Экспорт для биллинга',
    text: 'Выгружайте отработанные часы в CSV и выставляйте клиентам счета без ручных таблиц.',
  },
];

export function App() {
  return (
    <main style={{maxWidth: 960, margin: '0 auto', padding: '80px 24px'}}>
      {/* Hero */}
      <section style={{textAlign: 'center', marginBottom: 80}}>
        <Text variant="display-3" as="h1">
          Учёт времени команды без лишней возни
        </Text>
        <div style={{margin: '20px auto 32px', maxWidth: 560}}>
          <Text variant="body-3" color="secondary" as="p">
            Простой таймер и понятные отчёты для небольших команд. Начните за минуту —
            без внедрения и обучения.
          </Text>
        </div>
        <Button view="action" size="xl" href="#cta">
          Попробовать бесплатно
        </Button>
      </section>

      {/* Преимущества */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
          marginBottom: 80,
        }}
      >
        {benefits.map((b) => (
          <div key={b.title} style={{padding: 24, border: '1px solid var(--g-color-line-generic)', borderRadius: 12}}>
            <Text variant="subheader-2" as="h2">
              {b.title}
            </Text>
            <div style={{marginTop: 8}}>
              <Text variant="body-2" color="secondary" as="p">
                {b.text}
              </Text>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section id="cta" style={{textAlign: 'center'}}>
        <Text variant="display-1" as="h2">
          Начните учитывать время уже сегодня
        </Text>
        <div style={{margin: '16px auto 28px', maxWidth: 480}}>
          <Text variant="body-2" color="secondary" as="p">
            Бесплатно для команд до 5 человек. Карта не нужна.
          </Text>
        </div>
        <Button view="action" size="xl">
          Создать аккаунт
        </Button>
      </section>
    </main>
  );
}
