import { Button } from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton';

const NOTIFICATION_TOAST_NAME = 'screen-corner-notification';

export function App() {
  const showNotification = () => {
    toaster.add({
      autoHiding: 4000,
      content: 'Это всплывающее уведомление исчезнет через 4 секунды.',
      isClosable: true,
      name: NOTIFICATION_TOAST_NAME,
      title: 'Уведомление',
    });
  };

  return (
    <Button
      size="l"
      style={{ bottom: 'var(--g-spacing-8)', position: 'fixed', right: 'var(--g-spacing-8)' }}
      view="action"
      onClick={showNotification}
    >
      Показать уведомление
    </Button>
  );
}
