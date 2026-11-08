import { useRef, useState } from 'react';
import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const AUTO_HIDE_MS = 3000;

function NotifyButton() {
  const toaster = useToaster();
  const counter = useRef(0);

  const showToast = () => {
    counter.current += 1;
    toaster.add({
      name: `notification-${counter.current}`,
      title: 'Уведомление',
      content: 'Это уведомление исчезнет автоматически через 3 секунды.',
      theme: 'info',
      autoHiding: AUTO_HIDE_MS,
    });
  };

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1 }}>
      <Button view="action" size="l" onClick={showToast}>
        Показать уведомление
      </Button>
    </div>
  );
}

export function App() {
  // One Toaster instance for the lifetime of the app.
  const [toaster] = useState(() => new Toaster());

  return (
    <ToasterProvider toaster={toaster}>
      <NotifyButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
