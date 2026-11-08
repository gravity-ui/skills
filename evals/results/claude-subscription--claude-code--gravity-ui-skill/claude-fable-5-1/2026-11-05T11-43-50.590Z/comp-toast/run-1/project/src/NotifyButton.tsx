import { useRef } from 'react';
import { Button, useToaster } from '@gravity-ui/uikit';

const AUTO_HIDE_MS = 4000;

export function NotifyButton() {
  const { add } = useToaster();
  const counter = useRef(0);

  const handleClick = () => {
    counter.current += 1;
    add({
      // Unique name per click so repeated clicks stack new toasts instead of updating one
      name: `notification-${counter.current}`,
      title: 'Уведомление',
      content: 'Это всплывающее уведомление исчезнет автоматически.',
      theme: 'success',
      autoHiding: AUTO_HIDE_MS,
    });
  };

  return (
    <Button view="action" size="l" onClick={handleClick}>
      Показать уведомление
    </Button>
  );
}
