import { Button, Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import React from 'react';

export function App() {
  const toaster = React.useRef(new Toaster()).current;

  return (
    <ToasterProvider toaster={toaster}>
      <ToasterComponent />
      <Button
        view="action"
        size="m"
        onClick={() =>
          toaster.add({
            name: 'corner-button-notification',
            title: 'Уведомление',
            content: 'Кнопка нажата. Уведомление исчезнет автоматически.',
            autoHiding: 5000,
          })
        }
        style={{ position: 'fixed', top: 24, right: 24 }}
      >
        Показать уведомление
      </Button>
    </ToasterProvider>
  );
}
