import { useEffect, useState } from 'react';
import './styles.css';

const benefits = [
  {
    number: '01',
    title: 'Начать — один клик',
    description: 'Включите таймер и займитесь делом. Темп посчитает время, пока вы сосредоточены на работе.',
    detail: 'Меньше действий',
  },
  {
    number: '02',
    title: 'Вся команда в контексте',
    description: 'Понимайте, сколько времени уходит на проекты. Планируйте нагрузку без лишних созвонов.',
    detail: 'Больше ясности',
  },
  {
    number: '03',
    title: 'Цифры вместо догадок',
    description: 'Замечайте, что забирает больше всего времени. Оценивайте задачи точнее и берегите ресурс команды.',
    detail: 'Спокойнее работа',
  },
];

function formatTime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}

export function App() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hasTried, setHasTried] = useState(false);

  useEffect(() => {
    if (startedAt === null) return;
    const interval = window.setInterval(() => setElapsed(Date.now() - startedAt), 250);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  function toggleTimer() {
    if (startedAt !== null) {
      setElapsed(Date.now() - startedAt);
      setStartedAt(null);
    } else {
      setElapsed(0);
      setStartedAt(Date.now());
      setHasTried(true);
    }
  }

  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="brand-row">
          <span className="wordmark" aria-label="Темп">темп<span>.</span></span>
          <span className="brand-note">Работайте в своём ритме</span>
        </div>

        <div className="hero-content">
          <p className="eyebrow"><span aria-hidden="true" />УЧЁТ ВРЕМЕНИ ДЛЯ НЕБОЛЬШИХ КОМАНД</p>
          <h1 id="hero-title">Время под контролем.<br />Команда <span>в потоке.</span></h1>
          <p className="hero-description">Простой учёт времени, который помогает видеть главное.<br className="desktop-break" /> Меньше рутины. Больше внимания работе, которая важна.</p>
        </div>
        <div className="hero-bottom"><span>Всё нужное. Ничего лишнего.</span><span aria-hidden="true">↓</span></div>
      </section>

      <section className="benefits" aria-label="Три преимущества Темпа">
        {benefits.map((benefit) => (
          <article className="benefit" key={benefit.number}>
            <span className="benefit-number">{benefit.number}<span aria-hidden="true"> /</span></span>
            <h2>{benefit.title}</h2>
            <p>{benefit.description}</p>
            <span className="benefit-detail"><span aria-hidden="true">↗</span> {benefit.detail}</span>
          </article>
        ))}
      </section>

      <section className="cta" aria-labelledby="cta-title">
        <div className="cta-copy">
          <p className="cta-eyebrow">ХОРОШЕЙ РАБОТЕ — СВОЙ ТЕМП</p>
          <h2 id="cta-title">{hasTried ? (startedAt !== null ? <>Время пошло.<br />Вы в потоке.</> : <>Каждая минута<br />имеет значение.</>) : <>Меньше считать.<br />Больше создавать.</>}</h2>
        </div>
        <div className="cta-action">
          {hasTried && <output className="timer" aria-label="Время демо-сессии">{formatTime(elapsed)}</output>}
          <button className="cta-button" onClick={toggleTimer}>
            <span>{startedAt !== null ? 'Остановить таймер' : hasTried ? 'Попробовать ещё раз' : 'Попробовать в деле'}</span>
            <span className="button-symbol" aria-hidden="true">{startedAt !== null ? 'Ⅱ' : '↗'}</span>
          </button>
          <p className="cta-note" role="status">{startedAt !== null ? 'Демо-таймер работает. Займитесь важным.' : hasTried ? 'Таймер остановлен. Это ваш первый шаг.' : 'Без регистрации. Просто запустите таймер.'}</p>
        </div>
      </section>
    </main>
  );
}
