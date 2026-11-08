import { useEffect, useRef, useState } from 'react';
import './App.css';

export function App() {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = () => {
    setVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(false), 3200);
  };

  const dismissNotification = () => {
    setVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="demo-card" aria-labelledby="page-title">
        <div className="eyebrow"><span className="eyebrow-dot" /> ИНТЕРАКТИВНЫЙ ПРИМЕР</div>
        <div className="bell-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h1 id="page-title">Уведомления</h1>
        <p className="description">Нажмите на кнопку в углу экрана, чтобы увидеть всплывающее сообщение.</p>
        <div className="hint"><span className="hint-icon">↘</span><span>Кнопка находится в правом нижнем углу</span></div>
      </section>

      {visible && (
        <div className="toast" role="status" aria-live="polite">
          <div className="toast-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="m7 12.5 3.2 3.2L17.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div className="toast-copy">
            <strong>Готово!</strong>
            <span>Уведомление появилось и скоро исчезнет.</span>
          </div>
          <button className="toast-close" onClick={dismissNotification} aria-label="Закрыть уведомление">
            <svg viewBox="0 0 20 20" fill="none"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          </button>
          <div className="toast-progress" />
        </div>
      )}

      <button className="corner-button" onClick={showNotification}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>Показать уведомление</span>
      </button>
    </main>
  );
}
