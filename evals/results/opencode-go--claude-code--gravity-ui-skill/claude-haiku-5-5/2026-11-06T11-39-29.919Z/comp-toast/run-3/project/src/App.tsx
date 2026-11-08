import * as React from 'react';
import { Button, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton';

const TOAST_AUTO_HIDING_MS = 3000;

function NotifyButton() {
  // Each click gets its own toast name, so clicks stack instead of replacing each other.
  const counter = React.useRef(0);

  const handleClick = () => {
    counter.current += 1;
    toaster.add({
      name: `notification-${counter.current}`,
      title: 'Уведомление',
      content: 'Кнопка была нажата',
      theme: 'info',
      autoHiding: TOAST_AUTO_HIDING_MS,
    });
  };

  return (
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
  return (
    <ToasterProvider toaster={toaster}>
      <NotifyButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
