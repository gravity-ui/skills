const advantages = [
  {
    title: 'Точное время',
    text: 'Команда отмечает задачи одним действием, а руководитель видит реальные затраты без ручных отчётов.',
  },
  {
    title: 'Прозрачные проекты',
    text: 'Бюджеты и сроки связаны с фактическими часами, поэтому отклонения заметны сразу.',
  },
  {
    title: 'Простые отчёты',
    text: 'Готовые сводки по людям, проектам и периодам можно отправить клиенту за пару минут.',
  },
];

const sectionStyle = {
  maxWidth: 860,
  margin: '0 auto',
  padding: '0 20px',
};

const heroStyle = {
  padding: '88px 0 56px',
  textAlign: 'center',
} as const;

const featuresStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 20,
  padding: '0 0 64px',
} as const;

const featureStyle = {
  border: '1px solid #e5e9ee',
  borderRadius: 12,
  padding: 20,
  backgroundColor: '#fbfbfc',
} as const;

const ctaStyle = {
  padding: '56px 0 72px',
  textAlign: 'center',
  borderTop: '1px solid #e5e9ee',
} as const;

const buttonStyle = {
  display: 'inline-block',
  marginTop: 24,
  padding: '14px 28px',
  borderRadius: 10,
  backgroundColor: '#0077ff',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 600,
} as const;

export function App() {
  return (
    <main>
      <section style={heroStyle}>
        <div style={sectionStyle}>
          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.15 }}>
            Учёт времени для небольших команд
          </h1>
          <p style={{ margin: '18px auto 0', maxWidth: 580, color: '#4d5561', fontSize: 19 }}>
            Время фиксируется у источника, проекты остаются в бюджете, а отчёты собираются сами.
          </p>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={featuresStyle}>
          {advantages.map((advantage) => (
            <article key={advantage.title} style={featureStyle}>
              <h2 style={{ margin: '0 0 10px', fontSize: 21 }}>{advantage.title}</h2>
              <p style={{ margin: 0, color: '#4d5561' }}>{advantage.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={ctaStyle}>
        <div style={sectionStyle}>
          <h2 style={{ margin: 0, fontSize: 30 }}>Начните учитывать время сегодня</h2>
          <a href="#" style={buttonStyle}>
            Попробовать бесплатно
          </a>
        </div>
      </section>
    </main>
  );
}
