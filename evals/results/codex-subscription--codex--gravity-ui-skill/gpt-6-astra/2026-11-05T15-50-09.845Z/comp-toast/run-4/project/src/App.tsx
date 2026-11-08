import {useState} from 'react';
import {Button, Text, Toaster, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [toaster] = useState(() => new Toaster());

  const showNotification = () => {
    toaster.add({
      name: 'demo-notification',
      title: 'Уведомление отправлено',
      content: <span role="status">Всё получилось! Это сообщение закроется автоматически.</span>,
      theme: 'success',
      autoHiding: 4000,
      isClosable: true,
    });
  };

  return (
    <ToasterProvider toaster={toaster}>
      <main className="notification-page">
        <div className="notification-intro">
          <Text as="h1" variant="header-2">Всплывающие уведомления</Text>
          <Text as="p" variant="body-2" color="secondary">
            Нажмите кнопку в правом нижнем углу, чтобы показать уведомление.
            Оно исчезнет через 4 секунды.
          </Text>
        </div>
        <Button
          className="notification-trigger"
          view="action"
          size="l"
          onClick={showNotification}
        >
          Показать уведомление
        </Button>
      </main>
      <ToasterComponent className="notification-toaster" />
    </ToasterProvider>
  );
}
