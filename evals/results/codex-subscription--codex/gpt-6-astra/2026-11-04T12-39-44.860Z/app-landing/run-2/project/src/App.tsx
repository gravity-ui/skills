import { useEffect, useState } from 'react';
import './styles.css';

const benefits = [
  {
    number: '01',
    title: 'Начните с одного клика',
    description: 'Включите таймер и займитесь делом. Учёт времени станет привычкой, а не ещё одной задачей.',
  },
  {
    number: '02',
    title: 'Видьте полную картину',
    description: 'Понимайте, сколько времени уходит на проекты. Планируйте нагрузку без догадок и лишних таблиц.',
  },
  {
    number: '03',
    title: 'Берегите фокус команды',
    description: 'Меньше отчётов и вопросов «как дела?». Больше пространства для спокойной, осмысленной работы.',
  },
];

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return [hours, minutes, rest].map((value) => String(value).padStart(2, '0')).join(':');
}

export function App() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    if (startedAt === null) return;
    const update = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  function toggleTimer() {
    if (startedAt !== null) {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
      setStartedAt(null);
      setHasFinished(true);
    } else {
      setElapsed(0);
      setHasFinished(false);
      setStartedAt(Date.now());
    }
  }

  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-heading">
        <div className="wordmark" aria-label="Темпо">tempo<span>.</span></div>
        <div className="hero-content">
          <p className="eyebrow"><span className="status-dot" aria-hidden="true" />В своём темпе. Вместе.</p>
          <h1 id="hero-heading">Время под контролем.<br /><span>Команда в потоке.</span></h1>
          <p className="hero-description">Простой учёт времени для небольших команд.<br className="desktop-break" /> Чтобы понимать, куда уходят часы, и уделять больше времени главному.</p>
          <p className="hero-caption">Меньше рутины <span aria-hidden="true">/</span> Больше ясности</p>
        </div>
      </section>

      <section className="benefits" aria-label="Преимущества Tempo">
        {benefits.map((benefit) => (
          <article className="benefit" key={benefit.number}>
            <span className="benefit-number" aria-hidden="true">{benefit.number}</span>
            <h2>{benefit.title}</h2>
            <p>{benefit.description}</p>
          </article>
        ))}
      </section>

      <section className="cta" aria-labelledby="cta-heading">
        <div className="cta-copy">
          <p className="eyebrow">Каждая минута имеет значение</p>
          <h2 id="cta-heading">Найдите свой рабочий ритм.</h2>
          <p>Начните с одного небольшого фокус-сеанса.</p>
        </div>
        <div className="cta-action">
          <button className="cta-button" onClick={toggleTimer} aria-pressed={startedAt !== null}>
            {startedAt !== null ? 'Остановить таймер' : hasFinished ? 'Попробовать ещё раз' : 'Попробовать в деле'}
            <span aria-hidden="true">{startedAt !== null ? '■' : '↗'}</span>
          </button>
          <p className={`cta-note${startedAt !== null || hasFinished ? ' timer-note' : ''}`}>
            {startedAt !== null ? <><span className="status-dot" aria-hidden="true" />В фокусе · <span role="timer">{formatTime(elapsed)}</span></> : hasFinished ? `Сеанс завершён · ${formatTime(elapsed)}` : 'Демо-таймер. Без регистрации.'}
          </p>
          <span className="sr-only" role="status">{startedAt !== null ? 'Таймер запущен' : hasFinished ? `Таймер остановлен. Время сеанса: ${formatTime(elapsed)}` : ''}</span>
        </div>
      </section>
    </main>
  );
}
