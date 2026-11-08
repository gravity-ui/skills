import { useEffect, useState } from 'react';
import './styles.css';

const benefits = [
  {
    number: '01',
    title: 'Меньше рутины',
    description: 'Один клик — и время пошло. Никаких таблиц и воспоминаний о том, чем вы занимались вчера.',
  },
  {
    number: '02',
    title: 'Команда на виду',
    description: 'Понятно, кто над чем работает и как распределена нагрузка. Без лишних вопросов и микроменеджмента.',
  },
  {
    number: '03',
    title: 'Планы точнее',
    description: 'Знайте, сколько времени уходит на проекты. Оценивайте задачи на основе фактов, а не ощущений.',
  },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function App() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (startedAt === null) return;
    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  function toggleTimer() {
    if (startedAt !== null) {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
      setStartedAt(null);
    } else {
      setStartedAt(Date.now() - elapsed * 1000);
      setHasStarted(true);
    }
  }

  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="brand-row">
          <span className="wordmark" aria-label="Такт">такт<span>.</span></span>
          <span className="brand-caption">Время для главного</span>
        </div>

        <div className="hero-content">
          <p className="eyebrow"><span className="status-dot" aria-hidden="true" /> Учёт времени для небольших команд</p>
          <h1 id="hero-title">Время команды.<br /><span>Всё на виду.</span></h1>
          <p className="hero-description">Меньше считать часы. Больше делать важное.<br className="desktop-break" /> Простой учёт времени, с которым работа становится понятнее.</p>
          <span className="hero-note">В своём ритме. Вместе.</span>
        </div>
        <div className="section-caption"><span>МЕНЬШЕ СЛОЖНОСТЕЙ</span><span>БОЛЬШЕ ЯСНОСТИ</span></div>
      </section>

      <section className="benefits" aria-label="Три преимущества Такта">
        {benefits.map((benefit) => (
          <article className="benefit" key={benefit.number}>
            <span className="benefit-number">{benefit.number}<span aria-hidden="true"> /</span></span>
            <h2>{benefit.title}</h2>
            <p>{benefit.description}</p>
          </article>
        ))}
      </section>

      <section className="cta" aria-labelledby="cta-title">
        <div className="cta-copy">
          <p className="cta-eyebrow">ВАШЕ ВРЕМЯ ИМЕЕТ ЗНАЧЕНИЕ</p>
          <h2 id="cta-title">Поймайте свой ритм.</h2>
          <p>Начните с одной задачи. Остальное — в такт.</p>
        </div>
        <div className="cta-action">
          <button className="cta-button" onClick={toggleTimer} aria-pressed={startedAt !== null}>
            <span>{startedAt !== null ? 'Остановить' : hasStarted ? 'Продолжить' : 'Попробовать в деле'}</span>
            {hasStarted ? <span className="timer">{formatTime(elapsed)}</span> : <span className="button-arrow" aria-hidden="true">↗</span>}
          </button>
          <p className="cta-note" role="status">{startedAt !== null ? 'Таймер идёт. Сосредоточьтесь на главном.' : hasStarted ? 'Таймер на паузе. Продолжите, когда будете готовы.' : 'Без регистрации. Просто запустите таймер.'}</p>
        </div>
      </section>
    </main>
  );
}
