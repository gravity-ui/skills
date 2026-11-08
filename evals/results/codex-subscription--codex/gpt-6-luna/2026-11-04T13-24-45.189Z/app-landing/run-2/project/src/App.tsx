import './App.css';

const benefits = [
  {
    number: '01',
    title: 'Время видно целиком',
    description:
      'Собирайте часы по проектам и задачам в одном понятном месте — без разрозненных таблиц.',
  },
  {
    number: '02',
    title: 'Учёт без рутины',
    description:
      'Команда фиксирует время по ходу работы, а не вспоминает в конце недели, на что ушёл день.',
  },
  {
    number: '03',
    title: 'Нагрузка под контролем',
    description:
      'Замечайте перегрузку и свободные ресурсы заранее, чтобы планировать работу спокойнее.',
  },
];

export function App() {
  return (
    <main className="page-shell">
      <div className="page-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="brand-mark" aria-label="Такт">
            <span>такт</span>
          </div>

          <div className="hero-copy">
            <p className="eyebrow">Учёт времени команды</p>
            <h1 id="hero-title">
              Время команды —
              <br />
              <span>под вашим ритмом.</span>
            </h1>
            <p className="hero-description">
              Такт помогает понять, куда уходит время, и планировать работу без догадок и лишних таблиц.
            </p>
          </div>
        </section>

        <section className="benefits" aria-labelledby="benefits-title">
          <div className="section-heading">
            <p className="eyebrow">Меньше догадок, больше ясности</p>
            <h2 id="benefits-title">Работа идёт. Вы видите как.</h2>
          </div>
          <div className="benefit-grid">
            {benefits.map((benefit) => (
              <article className="benefit" key={benefit.number}>
                <span className="benefit-number">{benefit.number}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <div className="closing-copy">
            <p className="eyebrow">Такт — для команд, которым важен фокус</p>
            <h2 id="closing-title">Пора навести порядок во времени.</h2>
          </div>
          <a
            className="cta-button"
            href="mailto:hello@takt.team?subject=%D0%A5%D0%BE%D1%87%D1%83%20%D0%BF%D0%BE%D0%BF%D1%80%D0%BE%D0%B1%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%20%D0%A2%D0%B0%D0%BA%D1%82"
          >
            Попробовать Такт <span aria-hidden="true">↗</span>
          </a>
        </section>

      </div>
    </main>
  );
}
