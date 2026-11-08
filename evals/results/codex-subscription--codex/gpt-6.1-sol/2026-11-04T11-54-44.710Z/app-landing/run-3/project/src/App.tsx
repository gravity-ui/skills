import { useEffect, useState } from 'react';
import './App.css';

type Timer = { startedAt: number | null; elapsed: number };
const storageKey = 'tempo-demo-timer';

function readTimer(): Timer {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (
      saved &&
      (saved.startedAt === null || (typeof saved.startedAt === 'number' && Number.isFinite(saved.startedAt))) &&
      typeof saved.elapsed === 'number' && Number.isFinite(saved.elapsed) && saved.elapsed >= 0
    ) return saved;
  } catch { /* The demo also works when browser storage is unavailable. */ }
  return { startedAt: null, elapsed: 0 };
}

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${hours ? `${String(hours).padStart(2, '0')}:` : ''}${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

const benefits = [
  {
    number: '01',
    title: 'Начните с одного клика',
    description: 'Запустите таймер и займитесь делом. Учёт времени впишется в ваш рабочий ритм.',
  },
  {
    number: '02',
    title: 'Вся команда в контексте',
    description: 'Понимайте, сколько времени уходит на проекты, и распределяйте нагрузку без догадок.',
  },
  {
    number: '03',
    title: 'Ясность вместо таблиц',
    description: 'Все часы — в понятных отчётах. Меньше ручной работы, больше взвешенных решений.',
  },
];

export function App() {
  const [timer, setTimer] = useState<Timer>(readTimer);
  const [now, setNow] = useState(Date.now);
  const running = timer.startedAt !== null;
  const elapsed = timer.elapsed + (timer.startedAt === null ? 0 : Math.max(0, now - timer.startedAt));
  const hasSession = running || timer.elapsed > 0;

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(timer)); } catch { /* Storage is optional. */ }
  }, [timer]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [running]);

  function toggleTimer() {
    const timestamp = Date.now();
    setNow(timestamp);
    setTimer(current => current.startedAt === null
      ? { ...current, startedAt: timestamp }
      : { startedAt: null, elapsed: current.elapsed + Math.max(0, timestamp - current.startedAt) });
  }

  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="brand" aria-label="tempo">tempo<span>.</span></div>
        <div className="hero-content">
          <p className="eyebrow"><span className="status-dot" /> В РИТМЕ ВАШЕЙ КОМАНДЫ</p>
          <h1 id="hero-title">Меньше учёта.<br /><span>Больше фокуса.</span></h1>
          <p className="hero-description">Простой учёт времени для небольших команд.<br className="desktop-break" /> Знайте, куда уходят часы. Освободите место для важного.</p>
        </div>
        <div className="hero-footnote"><span className="small-line" /> Время — на вашей стороне.</div>
      </section>

      <section className="benefits" aria-label="Три преимущества tempo">
        {benefits.map(benefit => (
          <article className="benefit" key={benefit.number}>
            <span className="benefit-number">{benefit.number} <span aria-hidden="true">/</span></span>
            <h2>{benefit.title}</h2>
            <p>{benefit.description}</p>
          </article>
        ))}
      </section>

      <section className="cta" aria-labelledby="cta-title">
        <div className="cta-copy">
          <p className="cta-eyebrow">ВАШ СЛЕДУЮЩИЙ ЧАС</p>
          <h2 id="cta-title">Пусть он будет вашим.</h2>
          <p>Меньше рутины. Больше сделанного.</p>
        </div>
        <div className="cta-action">
          <button className="start-button" onClick={toggleTimer}>
            <span>{running ? 'Остановить' : hasSession ? 'Продолжить' : 'Попробовать таймер'}</span>
            {hasSession
              ? <span className="timer-value">{formatTime(elapsed)}</span>
              : <span className="button-arrow" aria-hidden="true">↗</span>}
          </button>
          <p className="cta-note" role="status">
            {running ? 'Таймер идёт. Сосредоточьтесь на важном.' : hasSession ? 'На паузе. Продолжите, когда будете готовы.' : 'Без регистрации. Просто начните.'}
          </p>
        </div>
      </section>
    </main>
  );
}
