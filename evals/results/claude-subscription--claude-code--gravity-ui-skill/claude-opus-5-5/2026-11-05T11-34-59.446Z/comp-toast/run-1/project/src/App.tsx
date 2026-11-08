import { useMemo, useRef } from 'react';
import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const AUTO_HIDE_MS = 5000;

function NotifyButton() {
  const toaster = useToaster();
  const counter = useRef(0);

  const handleClick = () => {
    counter.current += 1;
    toaster.add({
      // Unique name per click so several toasts can stack instead of replacing each other.
      name: `notification-${counter.current}`,
      title: 'Уведомление',
      content: 'Действие выполнено. Это сообщение скроется автоматически.',
      theme: 'success',
      autoHiding: AUTO_HIDE_MS,
      isClosable: true,
    });
  };

  return (
    // Top-right corner: uikit toasts render bottom-right, so the button never overlaps them.
    <div
      style={{
        position: 'fixed',
        top: 'var(--g-spacing-4)',
        right: 'var(--g-spacing-4)',
      }}
    >
      <Button view="action" size="l" onClick={handleClick}>
        Показать уведомление
      </Button>
    </div>
  );
}

export function App() {
  const toaster = useMemo(() => new Toaster(), []);

  return (
    <ToasterProvider toaster={toaster}>
      <NotifyButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
