import { useEffect, useState } from 'react';
import { Button } from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    if (!isToastVisible) return;

    const timeout = window.setTimeout(() => setIsToastVisible(false), 3500);
    return () => window.clearTimeout(timeout);
  }, [isToastVisible]);

  return (
    <main className="demo-page">
      <div className="demo-copy">
        <span className="demo-eyebrow">Интерфейсные элементы</span>
        <h1>Уведомления</h1>
        <p>Нажмите кнопку в углу экрана, чтобы увидеть всплывающее сообщение.</p>
      </div>

      {isToastVisible && (
        <section className="toast" role="status" aria-live="polite">
          <span className="toast__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="m7 12.5 3.2 3.2L17.5 8" />
            </svg>
          </span>
          <div className="toast__text">
            <strong>Готово!</strong>
            <span>Уведомление успешно показано.</span>
          </div>
          <button
            className="toast__close"
            type="button"
            aria-label="Закрыть уведомление"
            onClick={() => setIsToastVisible(false)}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </section>
      )}

      <Button
        className="show-toast-button"
        view="action"
        size="l"
        onClick={() => setIsToastVisible(true)}
      >
        Показать уведомление
      </Button>
    </main>
  );
}
