import {useState} from 'react';
import {Button, Text, Toaster, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [toaster] = useState(() => new Toaster());

  const showNotification = () => {
    toaster.add({
      name: 'demo-notification',
      title: 'Уведомление показано',
      content: 'Это сообщение автоматически исчезнет через 3 секунды.',
      theme: 'success',
      autoHiding: 3000,
      isClosable: true,
    });
  };

  return (
    <ToasterProvider toaster={toaster}>
      <main className="notification-page">
        <div className="notification-intro">
          <Text as="h1" variant="display-1">Всплывающие уведомления</Text>
          <Text as="p" variant="body-2" color="secondary">
            Нажмите на кнопку в углу экрана.
            <br />
            Уведомление появится и исчезнет само.
          </Text>
          <Text variant="caption-2" color="hint">Автоматическое закрытие через 3 секунды</Text>
        </div>
        <div className="notification-trigger">
          <Button view="action" size="xl" onClick={showNotification}>
            Показать уведомление
          </Button>
        </div>
      </main>
      <ToasterComponent className="notification-toaster" />
    </ToasterProvider>
  );
}
