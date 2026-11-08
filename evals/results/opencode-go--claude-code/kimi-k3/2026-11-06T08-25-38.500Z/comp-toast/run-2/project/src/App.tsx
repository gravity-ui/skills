import { Button, Toaster, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const toaster = new Toaster();

function CornerButton() {
  const { add } = useToaster();

  const showToast = () => {
    add({
      name: `toast-${Date.now()}`,
      title: 'Уведомление',
      content: 'Кнопка нажата! Это сообщение скоро само исчезнет.',
      theme: 'success',
      autoHiding: 3000,
    });
  };

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24 }}>
      <Button view="action" size="l" onClick={showToast}>
        Показать уведомление
      </Button>
    </div>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <CornerButton />
    </ToasterProvider>
  );
}
