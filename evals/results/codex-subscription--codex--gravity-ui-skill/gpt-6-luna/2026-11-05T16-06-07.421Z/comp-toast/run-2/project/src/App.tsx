import { useMemo } from 'react';
import {
  Button,
  Text,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

import './App.css';

function CornerNotificationButton() {
  const toaster = useToaster();

  const showNotification = () => {
    toaster.add({
      name: 'welcome-notification',
      title: 'Готово!',
      content: 'Это всплывающее уведомление. Оно исчезнет автоматически.',
      theme: 'success',
      autoHiding: 4000,
    });
  };

  return (
    <Button className="corner-button" view="action" size="l" onClick={showNotification}>
      Показать уведомление
    </Button>
  );
}

export function App() {
  const toaster = useMemo(() => new Toaster(), []);

  return (
    <ToasterProvider toaster={toaster}>
      <main className="app">
        <section className="app__content">
          <Text variant="header-1">Всплывающие уведомления</Text>
          <Text variant="body-1">Нажмите кнопку в углу экрана, чтобы показать уведомление.</Text>
        </section>
        <CornerNotificationButton />
        <ToasterComponent />
      </main>
    </ToasterProvider>
  );
}
