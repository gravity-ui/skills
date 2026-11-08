import './App.css';

const benefits = [
  {
    number: '01',
    title: 'Понятно, куда уходит время',
    description:
      'Собирайте часы по проектам и задачам в одном месте — без таблиц, которые живут своей жизнью.',
  },
  {
    number: '02',
    title: 'Учёт без лишних действий',
    description:
      'Запускайте таймер или добавляйте время вручную. Команда быстро привыкает, а записи не теряются.',
  },
  {
    number: '03',
    title: 'Отчёты для уверенных решений',
    description:
      'Смотрите загрузку команды и затраты по проектам, чтобы планировать работу на основе фактов.',
  },
];

export function App() {
  return (
    <main className="page-shell">
      <div className="page-content">
        <div className="wordmark">такт</div>

        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Учёт времени для команд</p>
          <h1 id="hero-title">
            Работайте в своём <span>ритме.</span>
          </h1>
          <p className="hero-copy">
            Такт помогает команде видеть, на что уходит время, и спокойно доводить важные проекты до конца.
          </p>
        </section>

        <section className="benefits" aria-label="Преимущества Такта">
          {benefits.map((benefit) => (
            <article className="benefit" key={benefit.number}>
              <span className="benefit-number">{benefit.number}</span>
              <h2>{benefit.title}</h2>
              <p>{benefit.description}</p>
            </article>
          ))}
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <div>
            <p className="eyebrow">Начните с ясности</p>
            <h2 id="closing-title">Пусть время работает на команду.</h2>
          </div>
          <a className="cta-button" href="mailto:hello@takt.team">
            Попробовать Такт <span aria-hidden="true">↗</span>
          </a>
        </section>
      </div>
    </main>
  );
}
