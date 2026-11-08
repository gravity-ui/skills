import {useState} from 'react';
import {Button, Text, Toaster, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [toaster] = useState(() => new Toaster());

  const showNotification = () => {
    toaster.add({
      name: 'demo-notification',
      title: 'Уведомление показано',
      content: 'Это сообщение исчезнет автоматически.',
      theme: 'success',
      autoHiding: 3000,
      isClosable: true,
    });
  };

  return (
    <ToasterProvider toaster={toaster}>
      <main className="notification-page">
        <div className="notification-intro">
          <Text as="h1" variant="header-2">Всплывающие уведомления</Text>
          <Text as="p" variant="body-2" color="secondary">
            Нажмите кнопку в правом нижнем углу экрана.
            Уведомление появится на 3 секунды и исчезнет само.
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
