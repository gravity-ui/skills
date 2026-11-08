import { useRef } from 'react';
import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

// Single toaster instance shared by the provider and the hook below.
const toaster = new Toaster();

function NotifyButton() {
  const { add } = useToaster();
  const clickCount = useRef(0);

  const handleClick = () => {
    clickCount.current += 1;
    // Unique name per click: toasts with the same name collapse into one.
    add({
      name: `notification-${clickCount.current}`,
      title: 'Уведомление',
      content: `Кнопка нажата ${clickCount.current} раз(а).`,
      theme: 'info',
      autoHiding: 5000,
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={handleClick}
      style={{ position: 'fixed', top: 'var(--g-spacing-4)', right: 'var(--g-spacing-4)' }}
    >
      Показать уведомление
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
