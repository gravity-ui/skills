import React from 'react';
import { Button, ToasterComponent, ToasterProvider, Toaster, useToaster } from '@gravity-ui/uikit';

const toaster = new Toaster();

function AppContent() {
  const toastApi = useToaster();

  const handleClick = () => {
    toastApi.add({
      name: 'demo-toast',
      title: 'Привет!',
      content: 'Это всплывающее уведомление',
      theme: 'success',
      autoHiding: 3000,
    });
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ position: 'fixed', bottom: 24, right: 24 }}>
        <Button view="action" size="l" onClick={handleClick}>
          Показать уведомление
        </Button>
      </div>
      <ToasterComponent />
    </div>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <AppContent />
    </ToasterProvider>
  );
}
