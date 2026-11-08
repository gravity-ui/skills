// Implement the requested feature here (and may add sibling files).
import { Button, useToaster } from '@gravity-ui/uikit';

export function App() {
  const toaster = useToaster();

  const showToast = () => {
    toaster.add({
      name: 'demo',
      title: 'Уведомление',
      content: 'Это всплывающее уведомление!',
      autoHiding: 3000,
    });
  };

  return (
    <Button
      style={{ position: 'fixed', bottom: 24, right: 24 }}
      view="action"
      size="l"
      onClick={showToast}
    >
      Показать уведомление
    </Button>
  );
}
