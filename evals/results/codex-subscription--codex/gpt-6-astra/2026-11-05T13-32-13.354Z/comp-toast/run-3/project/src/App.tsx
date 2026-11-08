import {useState} from 'react';
import {Button, Toaster, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';
import './App.css';

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function App() {
  const [toaster] = useState(() => new Toaster());

  const showNotification = () => {
    toaster.add({
      name: 'notification',
      title: 'Всё получилось!',
      content: 'Уведомление автоматически исчезнет через 3 секунды.',
      theme: 'success',
      autoHiding: 3000,
      isClosable: true,
    });
  };

  return (
    <ToasterProvider toaster={toaster}>
      <main className="notification-page">
        <div className="page-brand"><span className="brand-dot" /> Маленькие взаимодействия</div>
        <section className="intro">
          <div className="intro-icon"><BellIcon /></div>
          <p className="eyebrow">ВСЕГДА В КУРСЕ</p>
          <h1>Небольшое уведомление.<br />Всё под контролем.</h1>
          <p className="intro-description">Нажмите на кнопку в углу экрана — появится сообщение,<br className="desktop-break" /> которое исчезнет само через несколько секунд.</p>
          <div className="timing-note"><span /> 3 секунды — и снова ничего лишнего</div>
        </section>
        <div className="notification-trigger">
          <Button view="action" size="xl" onClick={showNotification}>
            <BellIcon /> Показать уведомление
          </Button>
        </div>
      </main>
      <div role="status" aria-live="polite" aria-atomic="true">
        <ToasterComponent className="notification-toaster" hasPortal={false} />
      </div>
    </ToasterProvider>
  );
}
