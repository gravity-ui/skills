import { useCallback, useRef } from 'react';
import { Button, useToaster } from '@gravity-ui/uikit';

export function App() {
  const { add } = useToaster();
  const counterRef = useRef(0);

  const showNotification = useCallback(() => {
    counterRef.current += 1;
    add({
      name: `notification-${counterRef.current}`,
      title: 'Готово!',
      content: 'Это уведомление исчезнет само через несколько секунд.',
      theme: 'success',
      autoHiding: 5000,
    });
  }, [add]);

  return (
    <Button
      view="action"
      size="l"
      onClick={showNotification}
      style={{
        position: 'fixed',
        right: 'var(--g-spacing-5)',
        bottom: 'var(--g-spacing-5)',
      }}
    >
      Показать уведомление
    </Button>
  );
}
