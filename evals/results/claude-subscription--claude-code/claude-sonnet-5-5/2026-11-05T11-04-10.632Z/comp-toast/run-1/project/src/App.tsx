import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const toaster = new Toaster();

const AUTO_HIDE_MS = 3000;

let toastCounter = 0;

function NotifyButton() {
  const { add } = useToaster();

  const handleClick = () => {
    add({
      // The name must be unique, otherwise repeated clicks would be ignored
      name: `notification-${++toastCounter}`,
      title: 'Уведомление',
      content: 'Кнопка нажата — это сообщение скроется само.',
      theme: 'success',
      autoHiding: AUTO_HIDE_MS,
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={handleClick}
      style={{ position: 'fixed', top: 16, right: 16 }}
    >
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ padding: 24 }}>
        <NotifyButton />
      </div>
      <ToasterComponent />
    </ToasterProvider>
  );
}
