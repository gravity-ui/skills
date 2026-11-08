import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const AUTO_HIDE_MS = 3000;
const toaster = new Toaster();

function ToastButton() {
  const { add } = useToaster();

  const showToast = () => {
    add({
      // имя должно быть уникальным, иначе повторный клик не создаст новое уведомление
      name: `toast-${Date.now()}`,
      title: 'Готово',
      content: 'Это всплывающее уведомление, оно исчезнет само',
      theme: 'success',
      autoHiding: AUTO_HIDE_MS,
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={showToast}
      style={{ position: 'fixed', top: 16, right: 16 }}
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
