import {useCallback, useRef, useState} from 'react';
import {Button, Toast} from '@gravity-ui/uikit';
import './App.css';

function Bell({size = 24}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 21h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Check() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 10 3.3 3.3L15 6.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function App() {
  const sequence = useRef(0);
  const [notificationId, setNotificationId] = useState<number | null>(null);
  const closeNotification = useCallback(() => setNotificationId(null), []);

  function showNotification() {
    setNotificationId(++sequence.current);
  }

  return (
    <div className="app">
      <header className="header">
        <a className="brand" href="./" aria-label="moment — главная">
          <span className="brand-mark" aria-hidden="true">✳</span>
          moment<span className="brand-period">.</span>
        </a>
        <span className="header-note">Меньше шума. Больше смысла.</span>
      </header>

      <main className="main">
        <div className="intro-label"><span /> МАЛЕНЬКИЕ ПОЛЕЗНЫЕ МОМЕНТЫ</div>
        <div className="bell-art" aria-hidden="true">
          <span className="orbit orbit-outer" />
          <span className="orbit orbit-inner" />
          <div className="bell-tile"><Bell size={42} /><span className="bell-dot" /></div>
          <span className="spark spark-one">+</span>
          <span className="spark spark-two">+</span>
          <span className="art-dot" />
        </div>
        <h1>В нужный момент.<br /><span>На пару секунд.</span></h1>
        <p className="description">Важное сообщение появится и исчезнет само.<br className="desktop-break" /> А вы продолжите заниматься своим делом.</p>
        <div className="hint"><span className="hint-dot" /> Нажмите на кнопку в правом нижнем углу <span className="hint-arrow" aria-hidden="true">↘</span></div>

        <div className="features">
          <div className="feature"><span className="feature-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 4 10 10-5 1-2 5L8 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg></span><div><strong>Всего один клик</strong><span>И сообщение уже здесь</span></div></div>
          <div className="feature"><span className="feature-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span><div><strong>Исчезнет само</strong><span>Через 4 секунды</span></div></div>
          <div className="feature"><span className="feature-icon"><Check /></span><div><strong>Всё под контролем</strong><span>Можно закрыть раньше</span></div></div>
        </div>
      </main>

      <footer className="footer"><span className="footer-dot" /> Немного внимания. Никаких отвлечений.</footer>

      <div className="notification-area" role="status" aria-live="polite" aria-atomic="true">
        {notificationId !== null && (
          <div className="notification" key={notificationId}>
            <Toast
              name={`notification-${notificationId}`}
              title="Всё получилось!"
              content="Это ваше уведомление. Оно скоро исчезнет само."
              theme="success"
              autoHiding={4000}
              isClosable
              removeCallback={closeNotification}
              renderIcon={() => <span className="success-icon"><Check /></span>}
            />
          </div>
        )}
      </div>
      <Button className="notification-button" view="action" size="xl" onClick={showNotification}>
        <Bell size={20} /><span>Показать уведомление</span><span className="button-plus" aria-hidden="true">+</span>
      </Button>
    </div>
  );
}
