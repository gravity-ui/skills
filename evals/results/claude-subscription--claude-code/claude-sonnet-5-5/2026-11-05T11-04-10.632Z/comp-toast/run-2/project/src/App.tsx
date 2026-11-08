import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const toaster = new Toaster();

const AUTO_HIDE_MS = 4000;

function NotifyButton() {
  const { add } = useToaster();

  const handleClick = () => {
    add({
      // Уникальное имя, чтобы повторные клики создавали отдельные уведомления
      name: `notification-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: 'Готово',
      content: 'Это всплывающее уведомление скроется само.',
      theme: 'success',
      autoHiding: AUTO_HIDE_MS,
      isClosable: true,
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={handleClick}
      aria-label="Показать уведомление"
      style={{ position: 'fixed', top: 16, right: 16 }}
    >
      Уведомить
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <NotifyButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
