import { Button, useToaster } from '@gravity-ui/uikit';

export function App() {
  const toaster = useToaster();

  const handleClick = () => {
    toaster.add({
      name: 'demo-notification',
      title: 'Привет!',
      content: 'Это всплывающее уведомление — оно исчезнет само.',
      theme: 'success',
      autoHiding: 3000,
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 24 }}>
      <Button view="action" size="l" onClick={handleClick}>
        Показать уведомление
      </Button>
    </div>
  );
}
