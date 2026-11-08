import { Button, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton';

const NOTIFICATION_NAME = 'request-success-notification';

export function App() {
  const showNotification = () => {
    if (toaster.has(NOTIFICATION_NAME)) {
      toaster.remove(NOTIFICATION_NAME);
    }

    toaster.add({
      name: NOTIFICATION_NAME,
      theme: 'success',
      title: 'Уведомление',
      content: 'Действие выполнено успешно.',
      autoHiding: 4000,
      isClosable: true,
    });
  };

  return (
    <ToasterProvider toaster={toaster}>
      <Button
        view="action"
        size="m"
        onClick={showNotification}
        style={{ position: 'fixed', right: 24, bottom: 24 }}
      >
        Показать уведомление
      </Button>
      <ToasterComponent />
    </ToasterProvider>
  );
}
