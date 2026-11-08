import { useEffect, useRef, useState } from 'react';
import './styles.css';

const benefits = [
  { number: '01', title: 'Один клик — и вы в потоке', text: 'Запустите таймер и займитесь делом. Такт посчитает время, пока вы работаете.', tag: 'Простой учёт' },
  { number: '02', title: 'Вся команда на одной волне', text: 'Видно, кто над чем работает и как распределена нагрузка. Без лишних созвонов.', tag: 'Общая картина' },
  { number: '03', title: 'Часы становятся понятными', text: 'Смотрите, сколько времени уходит на проекты. Планируйте по фактам, а не на глаз.', tag: 'Наглядные отчёты' },
];

export function App() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const elapsed = useRef(0);

  useEffect(() => {
    if (!running) return;
    const startedAt = Date.now() - elapsed.current * 1000;
    const interval = window.setInterval(() => {
      elapsed.current = Math.floor((Date.now() - startedAt) / 1000);
      setSeconds(elapsed.current);
    }, 250);
    return () => window.clearInterval(interval);
  }, [running]);

  const time = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((value) => String(value).padStart(2, '0')).join(':');

  return (
    <main className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div className="brand-line">
          <span className="wordmark" aria-label="Такт">такт<span>.</span></span>
          <span className="brand-note">Время работать в своём ритме</span>
        </div>
        <div className="hero-content">
          <p className="eyebrow"><span className="status-dot" /> Для небольших команд с большими планами</p>
          <h1 id="hero-title">Время команды.<br /><span>Всё по делу.</span></h1>
          <p className="hero-description">Простой учёт времени, который помогает видеть главное.<br className="desktop-break" /> Меньше рутины. Больше фокуса на работе, которая важна.</p>
          <div className="hero-caption"><span /> В вашем темпе. Вместе.<span /></div>
        </div>
      </section>

      <section className="benefits" aria-label="Преимущества Такта">
        {benefits.map((benefit) => (
          <article className="benefit" key={benefit.number}>
            <div className="benefit-top"><span className="benefit-number">{benefit.number}</span><span className="benefit-tag">{benefit.tag}</span></div>
            <h2>{benefit.title}</h2>
            <p>{benefit.text}</p>
          </article>
        ))}
      </section>

      <section className="cta" aria-labelledby="cta-title">
        <div>
          <p className="eyebrow">Хорошая работа начинается с фокуса</p>
          <h2 id="cta-title">Поймайте свой ритм.</h2>
          <p className="cta-description">Начните с первого часа. Остальное — дело Такта.</p>
        </div>
        <div className="cta-action">
          <button className="primary-button" onClick={() => dialog.current?.showModal()}>Попробовать таймер <span aria-hidden="true">↗</span></button>
          <span className="cta-note">Без регистрации. Просто попробуйте.</span>
        </div>
      </section>

      <dialog ref={dialog} className="timer-dialog" aria-labelledby="timer-title" onClose={() => setRunning(false)} onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
          event.currentTarget.close();
        }
      }}>
        <button className="close-button" aria-label="Закрыть таймер" onClick={() => dialog.current?.close()}>×</button>
        <p className="eyebrow">Немного времени для главного</p>
        <h2 id="timer-title">Ваш первый фокус</h2>
        <p className="timer-description">Выберите задачу и начните. Такт считает время.</p>
        <div className="timer-value" role="timer" aria-label="Время работы">{time}</div>
        <button className="primary-button timer-toggle" onClick={() => setRunning(!running)}>{running ? 'Приостановить' : seconds > 0 ? 'Продолжить' : 'Начать отсчёт'}<span aria-hidden="true">{running ? 'Ⅱ' : '→'}</span></button>
        <button className="reset-button" onClick={() => { setRunning(false); elapsed.current = 0; setSeconds(0); }} disabled={seconds === 0 && !running}>Сбросить таймер</button>
        <p className="demo-note">Это демо. Время не сохраняется после перезагрузки.</p>
      </dialog>
    </main>
  );
}
