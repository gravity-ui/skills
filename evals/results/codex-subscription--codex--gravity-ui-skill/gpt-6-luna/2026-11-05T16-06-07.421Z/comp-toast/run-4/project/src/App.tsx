import {useState} from 'react';
import {
  Button,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

function NotificationButton() {
  const toaster = useToaster();

  const showNotification = () => {
    toaster.add({
      name: 'corner-notification',
      title: 'Готово!',
      content: 'Уведомление исчезнет автоматически.',
      theme: 'success',
      autoHiding: 4000,
    });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <Button
        view="action"
        size="l"
        onClick={showNotification}
        style={{position: 'fixed', right: 24, bottom: 24, zIndex: 1}}
      >
        Показать уведомление
      </Button>
    </main>
  );
}

export function App() {
  const [toaster] = useState(() => new Toaster());

  return (
    <ToasterProvider toaster={toaster}>
      <ToasterComponent />
      <NotificationButton />
    </ToasterProvider>
  );
}
