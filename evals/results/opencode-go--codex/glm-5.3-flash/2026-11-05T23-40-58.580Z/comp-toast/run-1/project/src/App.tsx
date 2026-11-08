import { Button, useToaster } from '@gravity-ui/uikit';

const TOAST_NAME = 'feature-ready';

export function App() {
  const toaster = useToaster();

  const showNotification = () => {
    toaster.add({
      name: TOAST_NAME,
      title: 'Готово!',
      content: 'Это всплывающее уведомление исчезнет автоматически.',
      autoHiding: 3000,
      isClosable: true,
    });
  };

  return (
    <Button
      view="normal"
      size="m"
      onClick={showNotification}
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
      }}
    >
      Показать уведомление
    </Button>
  );
}
