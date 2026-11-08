import './App.css';

const benefits = [
  {
    number: '01',
    title: 'Понятно, куда уходит время',
    description: 'Записи по проектам и задачам собираются в одном месте — без таблиц и догадок.',
  },
  {
    number: '02',
    title: 'Команда видит общую картину',
    description: 'Сверяйте загрузку коллег и замечайте перекосы, пока они не стали проблемой.',
  },
  {
    number: '03',
    title: 'Отчёт готов за минуту',
    description: 'Получайте аккуратную сводку по проекту и периоду без ручного подсчёта часов.',
  },
];

export function App() {
  return (
    <main className="page-shell">
      <div className="page-content">
        <header className="brand" aria-label="Почас">
          <span className="brand-mark" aria-hidden="true">п</span>
          <span>почас</span>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow"><span className="status-dot" /> Учёт времени для команд</p>
          <h1 id="hero-title">Рабочее время.<br /><span>Без лишних вопросов.</span></h1>
          <p className="hero-copy">
            Почас помогает команде учитывать время по проектам, понимать загрузку и спокойно планировать работу.
          </p>
          <p className="hero-note">Меньше рутины. Больше ясности в каждом дне.</p>
        </section>

        <section className="benefits" aria-label="Преимущества Почас">
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
            <p className="closing-kicker">Пора навести порядок</p>
            <h2 id="closing-title">Время работать<br className="mobile-break" /> с ясной картиной.</h2>
          </div>
          <a className="cta" href="mailto:hello@pochas.app?subject=%D0%94%D0%BE%D1%81%D1%82%D1%83%D0%BF%20%D0%BA%20%D0%9F%D0%BE%D1%87%D0%B0%D1%81">
            Запросить доступ <span aria-hidden="true">↗</span>
          </a>
        </section>

      </div>
    </main>
  );
}
