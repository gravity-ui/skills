import {useState} from 'react';
import {Button, Toaster, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';

import './App.css';

function BellIcon({size = 20}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function App() {
  const [toaster] = useState(() => new Toaster());

  function showNotification() {
    toaster.add({
      name: 'notification',
      title: 'Уведомление получено',
      content: 'Всё получилось! Это сообщение исчезнет автоматически.',
      theme: 'success',
      autoHiding: 4000,
      isClosable: true,
    });
  }

  return (
    <ToasterProvider toaster={toaster}>
      <main className="notification-page">
        <header className="page-header">
          <span className="brand-icon"><BellIcon size={18} /></span>
          <span>Уведомления</span>
          <span className="demo-label">Демо</span>
        </header>

        <section className="notification-intro" aria-labelledby="page-title">
          <div className="intro-icon"><BellIcon size={30} /><span /></div>
          <span className="eyebrow">ВСЕГДА В КУРСЕ</span>
          <h1 id="page-title">Маленькое уведомление.<br />Всё самое важное.</h1>
          <p>Одно нажатие — и сообщение уже на экране.<br className="desktop-break" /> Через несколько секунд оно исчезнет само.</p>
          <div className="intro-hint"><span /> Нажмите кнопку в правом нижнем углу</div>
        </section>

        <div className="notification-trigger">
          <Button view="action" size="xl" onClick={showNotification}>
            <BellIcon size={18} />
            Показать уведомление
          </Button>
        </div>
      </main>
      <ToasterComponent className="notification-toaster" mobile={false} />
    </ToasterProvider>
  );
}
