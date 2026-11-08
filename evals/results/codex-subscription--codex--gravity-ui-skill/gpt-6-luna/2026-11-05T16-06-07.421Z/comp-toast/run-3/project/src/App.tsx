import {useState} from 'react';
import {
  Button,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

import './App.css';

function NotificationDemo() {
  const toaster = useToaster();
  const [notificationNumber, setNotificationNumber] = useState(0);

  const showNotification = () => {
    const nextNumber = notificationNumber + 1;
    setNotificationNumber(nextNumber);

    toaster.add({
      name: `saved-${nextNumber}`,
      title: 'Изменения сохранены',
      content: 'Все данные успешно обновлены.',
      theme: 'success',
      autoHiding: 3500,
      isClosable: true,
    });
  };

  return (
    <main className="demo">
      <section className="demo__card" aria-labelledby="demo-title">
        <span className="demo__eyebrow">ДЕМО ИНТЕРФЕЙСА</span>
        <h1 className="demo__title" id="demo-title">
          Уведомления
        </h1>
        <p className="demo__description">
          Нажмите на кнопку, чтобы увидеть всплывающее сообщение.
        </p>
      </section>

      <Button className="demo__button" view="action" size="l" onClick={showNotification}>
        Показать уведомление
      </Button>
    </main>
  );
}

export function App() {
  const [toaster] = useState(() => new Toaster());

  return (
    <ToasterProvider toaster={toaster}>
      <NotificationDemo />
      <ToasterComponent />
    </ToasterProvider>
  );
}
