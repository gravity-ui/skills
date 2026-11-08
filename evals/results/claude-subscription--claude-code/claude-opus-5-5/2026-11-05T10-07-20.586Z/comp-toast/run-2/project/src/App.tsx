import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

// Один экземпляр тостера на всё приложение.
const toaster = new Toaster();

let toastCounter = 0;

function NotifyButton() {
  const { add } = useToaster();

  const handleClick = () => {
    toastCounter += 1;
    add({
      // Уникальное имя, чтобы повторные клики создавали новые уведомления.
      name: `notification-${toastCounter}`,
      title: 'Уведомление',
      content: 'Действие выполнено успешно.',
      theme: 'success',
      autoHiding: 3000, // исчезает само через 3 секунды
      isClosable: true,
    });
  };

  return (
    <div style={{ position: 'fixed', top: 16, right: 16 }}>
      <Button view="action" size="l" onClick={handleClick}>
        Показать уведомление
      </Button>
    </div>
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
