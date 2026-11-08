import React from 'react';
import { Button, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton';

let toastCounter = 0;

export function App() {
  const showToast = () => {
    toastCounter += 1;

    toaster.add({
      name: `notification-${toastCounter}`,
      title: 'Уведомление',
      content: 'Всплывающее уведомление показано.',
      theme: 'info',
      autoHiding: 4000,
    });
  };

  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ position: 'fixed', bottom: 16, right: 16 }}>
        <Button view="outlined" size="l" onClick={showToast}>
          Показать уведомление
        </Button>
      </div>
      <ToasterComponent />
    </ToasterProvider>
  );
}
