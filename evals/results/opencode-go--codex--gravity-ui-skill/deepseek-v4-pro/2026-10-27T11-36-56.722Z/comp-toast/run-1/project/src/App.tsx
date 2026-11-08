import {Button, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

const NOTIFICATION_NAME = 'corner-notification';

export function App() {
  const showNotification = () => {
    toaster.add({
      name: NOTIFICATION_NAME,
      title: 'Уведомление',
      content: 'Всё получилось! Это сообщение исчезнет само.',
      theme: 'success',
      autoHiding: 3000,
    });
  };

  return (
    <ToasterProvider toaster={toaster}>
      <Button
        view="action"
        onClick={showNotification}
        style={{
          position: 'fixed',
          right: 'var(--g-spacing-6)',
          bottom: 'var(--g-spacing-6)',
        }}
      >
        Показать уведомление
      </Button>
      <ToasterComponent />
    </ToasterProvider>
  );
}
