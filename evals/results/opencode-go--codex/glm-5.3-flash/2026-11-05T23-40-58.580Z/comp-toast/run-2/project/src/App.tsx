import React, { useState } from 'react';
import { Button, Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import { Bell } from '@gravity-ui/icons';

export function App() {
  const [toaster] = useState(() => new Toaster());

  const showToast = () => {
    toaster.add({
      name: `corner-button-toast-${Date.now()}`,
      title: 'Уведомление',
      content: 'Кнопка нажата — всплывашка скоро исчезнет.',
      theme: 'info',
      autoHiding: 3000,
      isClosable: true,
    });
  };

  return (
    <ToasterProvider toaster={toaster}>
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 100000,
        }}
      >
        <Button view="action" size="m" pin="circle-circle" onClick={showToast} aria-label="Показать уведомление">
          <Button.Icon>
            <Bell />
          </Button.Icon>
        </Button>
      </div>

      <ToasterComponent />
    </ToasterProvider>
  );
}
