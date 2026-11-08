import * as React from 'react';
import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

// Single toaster instance for the whole app.
const toaster = new Toaster();

// Toast auto-hide timeout, ms.
const AUTO_HIDE_MS = 3000;

function NotifyButton() {
  const { add } = useToaster();
  const counter = React.useRef(0);

  const handleClick = () => {
    counter.current += 1;
    add({
      // Unique name so repeated clicks stack new toasts instead of replacing one.
      name: `notification-${counter.current}`,
      title: 'Уведомление',
      content: 'Это всплывающее уведомление скоро исчезнет само.',
      theme: 'info',
      autoHiding: AUTO_HIDE_MS,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        insetBlockStart: 'var(--g-spacing-4)',
        insetInlineEnd: 'var(--g-spacing-4)',
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
      {/* Renders toasts in a portal; uikit places them in the bottom-right corner. */}
      <ToasterComponent />
    </ToasterProvider>
  );
}
