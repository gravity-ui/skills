import * as React from 'react';

import { Button, Toaster, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';

const TOAST_NAME = 'corner-notification';

export function App() {
  const toaster = React.useRef(new Toaster());

  const showNotification = () => {
    toaster.current.add({
      name: TOAST_NAME,
      title: 'Уведомление',
      content: 'Оно исчезнет автоматически.',
      autoHiding: 3000,
      isClosable: false,
    });
  };

  return (
    <ToasterProvider toaster={toaster.current}>
      <Button
        onClick={showNotification}
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
        }}
      >
        Показать уведомление
      </Button>
      <ToasterComponent />
    </ToasterProvider>
  );
}
