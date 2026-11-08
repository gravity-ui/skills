import { useRef } from 'react';
import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

// Один экземпляр тостера на всё приложение.
const toaster = new Toaster();

const AUTO_HIDE_MS = 3000;

function NotifyButton() {
  const { add } = useToaster();
  const counter = useRef(0);

  const handleClick = () => {
    counter.current += 1;
    add({
      // Уникальное имя, чтобы повторные клики показывали новые уведомления,
      // а не перезаписывали предыдущее.
      name: `notification-${counter.current}`,
      title: 'Уведомление',
      content: 'Действие выполнено успешно.',
      theme: 'success',
      autoHiding: AUTO_HIDE_MS,
      isClosable: true,
    });
  };

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1 }}>
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
