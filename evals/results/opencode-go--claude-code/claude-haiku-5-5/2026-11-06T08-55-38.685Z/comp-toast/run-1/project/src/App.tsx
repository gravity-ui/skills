import { useRef, useState } from 'react';
import {
  Button,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

const TOAST_AUTO_HIDING_MS = 4000;

function NotifyButton() {
  const { add } = useToaster();
  const clickCount = useRef(0);

  const handleClick = () => {
    clickCount.current += 1;
    const n = clickCount.current;
    add({
      // Unique name per click, so several notifications can stack up at once.
      name: `notification-${n}`,
      title: 'Уведомление',
      content: `Нажатий на кнопку: ${n}.`,
      theme: 'info',
      autoHiding: TOAST_AUTO_HIDING_MS,
    });
  };

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24 }}>
      <Button view="action" size="l" onClick={handleClick}>
        Показать уведомление
      </Button>
    </div>
  );
}

export function App() {
  const [toaster] = useState(() => new Toaster());

  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ padding: 24 }} />
      <NotifyButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
