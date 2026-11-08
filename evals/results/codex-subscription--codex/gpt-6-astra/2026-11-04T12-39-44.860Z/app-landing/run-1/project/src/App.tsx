import './styles.css';

// Replace with your registration URL or contact email before publishing.
const CONTACT_URL = 'mailto:hello@tempo.example?subject=Подключение%20команды%20к%20Tempo';

const benefits = [
  {
    number: '01',
    title: 'Меньше рутины',
    description: 'Запускайте таймер и занимайтесь делом. Рабочие часы сохраняются, пока вы в фокусе.',
    note: 'Один клик — и время пошло',
  },
  {
    number: '02',
    title: 'Больше ясности',
    description: 'Всё время команды — по проектам и задачам. Сразу понятно, на что уходят силы.',
    note: 'Вся картина в одном месте',
  },
  {
    number: '03',
    title: 'Спокойнее планирование',
    description: 'Опирайтесь на реальные часы, чтобы точнее оценивать задачи и беречь ресурс команды.',
    note: 'Реальные данные вместо догадок',
  },
];

export function App() {
  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="wordmark" aria-label="Tempo">tempo<span>.</span></div>
        <div className="hero-content">
          <p className="eyebrow"><span aria-hidden="true" />Простой учёт времени для команд</p>
          <h1 id="hero-title">Время на важное.<br /><span>Остальное — tempo.</span></h1>
          <p className="hero-description">
            Меньше таблиц, больше любимого дела. Учитывайте время,<br className="desktop-break" />
            {' '}понимайте загрузку и работайте в своём ритме.
          </p>
          <p className="hero-caption">Для небольших команд, которые ценят своё время</p>
        </div>
      </section>

      <section className="benefits" aria-label="Три преимущества Tempo">
        {benefits.map((benefit) => (
          <article className="benefit" key={benefit.number}>
            <span className="benefit-number" aria-hidden="true">{benefit.number}</span>
            <h2>{benefit.title}</h2>
            <p>{benefit.description}</p>
            <div className="benefit-note">{benefit.note}</div>
          </article>
        ))}
      </section>

      <section className="cta" aria-labelledby="cta-title">
        <div className="cta-copy">
          <p className="eyebrow">Вашей команде подойдёт</p>
          <h2 id="cta-title">Поймайте свой ритм.</h2>
          <p>Начните с простого. Освободите время для большего.</p>
        </div>
        <div className="cta-action">
          <a className="cta-button" href={CONTACT_URL}>Обсудить подключение <span aria-hidden="true">↗</span></a>
          <span className="cta-caption">Большие дела начинаются с маленького шага</span>
        </div>
      </section>
    </main>
  );
}
