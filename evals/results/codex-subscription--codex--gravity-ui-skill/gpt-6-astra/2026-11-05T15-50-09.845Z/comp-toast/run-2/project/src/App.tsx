import {useState} from 'react';
import {Button, Text, Toaster, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [toaster] = useState(() => new Toaster());

  const showNotification = () => {
    toaster.add({
      name: 'demo-notification',
      title: 'Всё получилось!',
      content: 'Это уведомление закроется автоматически.',
      theme: 'success',
      autoHiding: 4000,
      isClosable: true,
    });
  };

  return (
    <ToasterProvider toaster={toaster}>
      <div className="notification-page">
        <div className="page-heading">
          <span className="brand-mark" aria-hidden="true">n.</span>
          <Text variant="subheader-2">Уведомления</Text>
          <Text variant="caption-2" className="example-label">ИНТЕРАКТИВНЫЙ ПРИМЕР</Text>
        </div>

        <main className="intro">
          <div className="notification-art" aria-hidden="true">
            <div className="art-back" />
            <div className="art-front">
              <span className="success-mark">✓</span>
              <div className="art-lines"><span /><span /></div>
              <span className="art-dot" />
            </div>
          </div>
          <Text variant="caption-2" className="eyebrow">МАЛЕНЬКИЕ СООБЩЕНИЯ. БОЛЬШАЯ ПОЛЬЗА.</Text>
          <Text as="h1" variant="display-2" className="intro-title">Важное — на мгновение.</Text>
          <Text as="p" variant="body-3" color="secondary" className="intro-description">
            Нажмите кнопку в углу экрана, чтобы увидеть уведомление.
            Оно появится на несколько секунд и исчезнет само.
          </Text>
          <div className="duration-note">
            <span className="duration-dot" aria-hidden="true" />
            <Text variant="body-1" color="secondary">Автоматическое закрытие через 4 секунды</Text>
          </div>
        </main>

        <div className="page-footnote">
          <Text variant="caption-2" color="secondary">Ненавязчиво. Вовремя. По делу.</Text>
        </div>
        <div className="notification-trigger">
          <Button view="action" size="xl" onClick={showNotification}>
            Показать уведомление <span className="button-arrow" aria-hidden="true">↗</span>
          </Button>
        </div>
        <ToasterComponent className="notification-toaster" />
      </div>
    </ToasterProvider>
  );
}
