import './App.css';

const benefits = [
  {
    number: '01',
    title: 'Понятно, куда уходит время',
    description:
      'Собирайте часы по проектам и задачам в одном месте — без таблиц и бесконечных уточнений.',
  },
  {
    number: '02',
    title: 'Команда в одном ритме',
    description:
      'Каждый видит свои записи, а руководитель — загрузку команды и прогресс по проектам.',
  },
  {
    number: '03',
    title: 'Отчёты без ручной работы',
    description:
      'Получайте аккуратную сводку по проектам и периоду, чтобы планировать следующие шаги.',
  },
];

export function App() {
  return (
    <main className="page-shell">
      <div className="page-content">
        <section className="hero" aria-labelledby="hero-title">
          <span className="eyebrow"><span className="eyebrow-dot" /> Учёт времени команды</span>
          <h1 id="hero-title">Время команды.<br /><span>Под вашим контролем.</span></h1>
          <p className="hero-copy">
            Удобный учёт часов по проектам, чтобы команда работала слаженно,
            а вы принимали решения на основе ясной картины.
          </p>
        </section>

        <section className="benefits" aria-label="Преимущества">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.number}>
              <span className="benefit-number">{benefit.number}</span>
              <h2>{benefit.title}</h2>
              <p>{benefit.description}</p>
            </article>
          ))}
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <div>
            <span className="closing-kicker">Меньше рутины. Больше ясности.</span>
            <h2 id="closing-title">Начните учитывать время по-новому</h2>
          </div>
          <a className="cta-button" href="mailto:hello@timely.team?subject=Доступ%20к%20Timely">
            Попробовать Timely <span aria-hidden="true">↗</span>
          </a>
        </section>

      </div>
    </main>
  );
}
