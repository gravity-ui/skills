import { Button, useToaster } from '@gravity-ui/uikit';

export function App() {
  const { add } = useToaster();

  const handleClick = () => {
    add({
      // Unique name so repeated clicks show a fresh toast instead of updating the previous one.
      name: `success-toast-${Date.now()}`,
      title: 'Готово',
      content: 'Всплывающее уведомление показано и скоро исчезнет само.',
      theme: 'success',
      // Auto-dismiss after 5s (the Toaster default); the toast disappears by itself.
      autoHiding: 5000,
    });
  };

  return (
    <div style={{ position: 'fixed', top: 24, right: 24 }}>
      <Button view="action" size="l" onClick={handleClick}>
        Показать уведомление
      </Button>
    </div>
  );
}
