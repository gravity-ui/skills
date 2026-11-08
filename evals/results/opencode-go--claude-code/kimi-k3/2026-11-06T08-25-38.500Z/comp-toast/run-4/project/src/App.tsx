import React from 'react';
import {
  Button,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

const toaster = new Toaster();

function CornerButton() {
  const { add } = useToaster();

  const showToast = () => {
    add({
      name: 'corner-toast-' + Date.now(),
      title: 'Уведомление',
      content: 'Это всплывающее уведомление скоро исчезнет само.',
      theme: 'success',
      autoHiding: 4000,
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={showToast}
      style={{ position: 'fixed', right: 24, bottom: 24 }}
    >
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ padding: 24 }}>
        <CornerButton />
      </div>
      <ToasterComponent />
    </ToasterProvider>
  );
}
