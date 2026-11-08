import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const toaster = new Toaster();

function ToastButton() {
  const { add } = useToaster();

  return (
    <Button
      style={{ position: 'fixed', top: 24, right: 24 }}
      size="l"
      view="action"
      onClick={() =>
        add({
          name: 'click-notification',
          title: 'Уведомление',
          content: 'Кнопка нажата. Сообщение исчезнет автоматически.',
          theme: 'normal',
          autoHiding: 4000,
        })
      }
    >
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <ToastButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
