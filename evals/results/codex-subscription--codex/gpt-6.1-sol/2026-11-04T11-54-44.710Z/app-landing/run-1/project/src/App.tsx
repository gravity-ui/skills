import { useEffect, useRef, useState } from 'react';
import './styles.css';

const benefits = [
  {
    number: '01',
    title: 'Время под контролем',
    description: 'Один клик — и таймер запущен. Собирайте рабочие часы без таблиц и лишних действий.',
    note: 'Меньше ручной работы',
  },
  {
    number: '02',
    title: 'Команда на одной волне',
    description: 'Видно, кто над чем работает и как распределена нагрузка. Планируйте с заботой о команде.',
    note: 'Больше прозрачности',
  },
  {
    number: '03',
    title: 'Ясность в каждом проекте',
    description: 'Понимайте, куда уходит время. Простые отчёты помогают точнее оценивать задачи и сроки.',
    note: 'Решения на основе данных',
  },
];

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return [...(hours ? [hours] : []), minutes, remainder]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}

export function App() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const accumulated = useRef(0);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!running) return;
    const update = () => setElapsed(accumulated.current + Math.floor((Date.now() - startedAt.current) / 1000));
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [running]);

  function toggleTimer() {
    if (running) {
      accumulated.current += Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(accumulated.current);
      setRunning(false);
    } else {
      startedAt.current = Date.now();
      setStarted(true);
      setRunning(true);
    }
  }

  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="brand-row">
          <span className="wordmark" aria-label="Такт">такт<span>®</span></span>
          <span className="brand-note">У каждого часа<br />есть значение.</span>
        </div>
        <div className="hero-content">
          <div className="eyebrow"><span className="status-dot" /> УЧЁТ ВРЕМЕНИ ДЛЯ КОМАНД</div>
          <h1 id="hero-title">Меньше рутины.<br />Больше времени<br />на <span>главное.</span></h1>
          <div className="hero-bottom">
            <p className="hero-description">Простой учёт времени, который помогает команде<br className="desktop-break" /> работать осознанно. Без лишнего шума.</p>
            <span className="hero-aside">В вашем ритме.<br />Вместе с командой.</span>
          </div>
        </div>
      </section>

      <section className="benefits" aria-label="Три преимущества Такта">
        {benefits.map((benefit) => (
          <article className="benefit" key={benefit.number}>
            <span className="benefit-number">{benefit.number}</span>
            <h2>{benefit.title}</h2>
            <p>{benefit.description}</p>
            <div className="benefit-note"><span>↳</span> {benefit.note}</div>
          </article>
        ))}
      </section>

      <section className="cta" aria-labelledby="cta-title">
        <div className="cta-copy">
          <span className="cta-eyebrow">ХОРОШЕЙ РАБОТЕ НУЖЕН СВОЙ РИТМ</span>
          <h2 id="cta-title">Начните с одной минуты.</h2>
          <p>Меньше считать. Больше успевать.</p>
        </div>
        <div className="cta-action">
          <button className="primary-button" onClick={toggleTimer} aria-pressed={running}>
            <span>{!started ? 'Попробовать таймер' : running ? 'Пауза' : 'Продолжить'}</span>
            {started ? <span className="timer">{formatTime(elapsed)}</span> : <span className="button-arrow" aria-hidden="true">↗</span>}
          </button>
          <span className="cta-caption" role="status">
            {!started ? 'Прямо здесь. Без регистрации.' : running ? 'Время пошло. Сосредоточьтесь на главном.' : 'Таймер на паузе. Продолжите, когда будете готовы.'}
          </span>
        </div>
      </section>
    </main>
  );
}
