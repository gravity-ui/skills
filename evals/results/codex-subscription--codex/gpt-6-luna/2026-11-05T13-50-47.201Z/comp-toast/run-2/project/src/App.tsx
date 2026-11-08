import { useEffect, useRef, useState } from 'react';
import { Button } from '@gravity-ui/uikit';
import './App.css';

const NOTIFICATION_DURATION = 3600;

export function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [notificationId, setNotificationId] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissNotification = () => {
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const showNotification = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setNotificationId((id) => id + 1);
    setIsVisible(true);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      timeoutRef.current = null;
    }, NOTIFICATION_DURATION);
  };

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <main className="demo-page">
      <section className="intro-card" aria-labelledby="page-title">
        <div className="intro-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
          </svg>
        </div>
        <p className="eyebrow">ИНТЕРАКТИВНЫЙ ПРИМЕР</p>
        <h1 id="page-title">Уведомления</h1>
        <p className="intro-copy">Нажмите на кнопку в углу экрана, чтобы увидеть, как работает всплывающее уведомление.</p>
        <div className="hint-row">
          <span className="hint-dot" />
          <span>Уведомление исчезнет автоматически через несколько секунд</span>
        </div>
      </section>

      <div className="corner-action">
        <span className="button-caption">Попробуйте сами</span>
        <Button view="action" size="l" className="notify-button" onClick={showNotification}>
          <svg className="button-bell" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
          </svg>
          Показать уведомление
        </Button>
      </div>

      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {isVisible && (
          <div key={notificationId} className="toast-card" role="status">
            <div className="toast-success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="m6 12.5 4 4L18.5 8" /></svg>
            </div>
            <div className="toast-message">
              <p className="toast-title">Готово!</p>
              <p className="toast-description">Уведомление успешно показано.</p>
            </div>
            <button className="toast-close" type="button" onClick={dismissNotification} aria-label="Закрыть уведомление">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
            </button>
            <div className="toast-timer" style={{ animationDuration: `${NOTIFICATION_DURATION}ms` }} />
          </div>
        )}
      </div>
    </main>
  );
}
