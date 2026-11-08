import { useEffect, useState } from 'react';
import './styles.css';

const benefits = [
  {
    number: '01',
    title: 'Меньше действий',
    description: 'Один клик — и время пошло. Команда занимается работой, а не заполнением таблиц.',
    note: 'Простой учёт',
  },
  {
    number: '02',
    title: 'Больше ясности',
    description: 'Всё время команды — в разрезе проектов и задач. Сразу видно, куда уходят часы.',
    note: 'Понятная картина',
  },
  {
    number: '03',
    title: 'Спокойнее планирование',
    description: 'Опирайтесь на реальные часы, чтобы оценивать задачи и распределять нагрузку без догадок.',
    note: 'Реалистичные сроки',
  },
];

function formatTime(seconds: number) {
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}

export function App() {
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'stopped'>('idle');
  const [startedAt, setStartedAt] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (timerState !== 'running') return;
    const interval = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => window.clearInterval(interval);
  }, [timerState, startedAt]);

  function handleTimer() {
    if (timerState === 'running') {
      setSeconds(Math.floor((Date.now() - startedAt) / 1000));
      setTimerState('stopped');
    } else {
      setSeconds(0);
      setStartedAt(Date.now());
      setTimerState('running');
    }
  }

  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="brand-row">
          <div className="wordmark" aria-label="Темпо">темпо<span>.</span></div>
          <span className="brand-note">У работы есть свой ритм.</span>
        </div>

        <div className="hero-content">
          <p className="eyebrow"><span className="status-dot" />ВРЕМЯ КОМАНДЫ, БЕЗ ЛИШНЕГО</p>
          <h1 id="hero-title">Большие дела.<br /><span>Каждая минута в счёт.</span></h1>
          <p className="hero-description">Простой учёт времени для небольших команд.<br className="desktop-break" /> Меньше рутины, понятнее проекты — больше времени на главное.</p>
          <div className="hero-footnote"><span>Работайте в своём темпе.</span><span className="footnote-divider" />Остальное посчитаем.</div>
        </div>
      </section>

      <section className="benefits" aria-label="Три преимущества Темпо">
        {benefits.map((benefit) => (
          <article className="benefit" key={benefit.number}>
            <span className="benefit-number">/ {benefit.number}</span>
            <h2>{benefit.title}</h2>
            <p>{benefit.description}</p>
            <span className="benefit-note">{benefit.note}</span>
          </article>
        ))}
      </section>

      <section className="cta" aria-labelledby="cta-title">
        <div className="cta-copy">
          <p className="cta-eyebrow">ВАШЕ ВРЕМЯ. ВАШ ТЕМП.</p>
          <h2 id="cta-title">{timerState === 'idle' ? <>Пора освободить время<br />для главного.</> : timerState === 'running' ? 'Вы в своём ритме.' : 'Хорошее начало.'}</h2>
          {timerState === 'idle' ? (
            <p className="cta-description">Начните с одного клика. Почувствуйте, как это просто.</p>
          ) : (
            <div className="timer-result">
              <span className="timer" role="timer" aria-label="Время с начала отсчёта">{formatTime(seconds)}</span>
              <span className="timer-status" role="status">{timerState === 'running' ? 'Таймер идёт. Сосредоточьтесь на главном.' : 'Отсчёт завершён. Попробуем ещё раз?'}</span>
            </div>
          )}
        </div>
        <div className="cta-action">
          <button className="cta-button" type="button" onClick={handleTimer}>
            {timerState === 'idle' ? 'Попробовать таймер' : timerState === 'running' ? 'Остановить таймер' : 'Начать заново'}
            <span aria-hidden="true">{timerState === 'running' ? 'Ⅱ' : '↗'}</span>
          </button>
          <p>Без регистрации и лишних шагов</p>
        </div>
      </section>
    </main>
  );
}
