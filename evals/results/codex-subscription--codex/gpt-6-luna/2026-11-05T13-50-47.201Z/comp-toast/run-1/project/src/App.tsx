import { useMemo } from 'react';
import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';
import './App.css';

function NotificationDemo() {
  const toaster = useToaster();

  const showNotification = () => {
    toaster.add({
      name: `notice-${Date.now()}`,
      title: 'Всё готово',
      content: 'Действие выполнено успешно.',
      theme: 'success',
      autoHiding: 4500,
      isClosable: true,
    });
  };

  return (
    <main className="demo-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="demo-card" aria-labelledby="page-title">
        <div className="eyebrow"><span className="status-dot" /> ИНТЕРАКТИВНЫЙ ПРИМЕР</div>
        <div className="bell-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M24 7.5a2 2 0 0 1 2 2v1.1c5.2.9 9 5.4 9 10.8v6.3l3.2 5.2c.6 1-.1 2.3-1.3 2.3H11.1c-1.2 0-1.9-1.3-1.3-2.3l3.2-5.2v-6.3c0-5.4 3.8-9.9 9-10.8V9.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M20 40a4.2 4.2 0 0 0 8 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span className="bell-ping" />
        </div>
        <h1 id="page-title">Уведомления<br />всегда к месту</h1>
        <p className="description">Нажмите на кнопку в углу экрана — появится короткое сообщение, которое исчезнет само.</p>
        <div className="card-divider" />
        <div className="hint-row">
          <span className="hint-icon" aria-hidden="true">↘</span>
          <span>Кнопка ждёт вас в правом нижнем углу</span>
        </div>
      </section>

      <div className="page-caption">МИКРОВЗАИМОДЕЙСТВИЕ <span>·</span> 01</div>

      <Button className="notify-button" view="action" size="l" onClick={showNotification}>
        <span className="button-plus" aria-hidden="true">+</span>
        Показать уведомление
      </Button>
    </main>
  );
}

export function App() {
  const toaster = useMemo(() => new Toaster(), []);

  return (
    <ToasterProvider toaster={toaster}>
      <NotificationDemo />
      <ToasterComponent />
    </ToasterProvider>
  );
}
