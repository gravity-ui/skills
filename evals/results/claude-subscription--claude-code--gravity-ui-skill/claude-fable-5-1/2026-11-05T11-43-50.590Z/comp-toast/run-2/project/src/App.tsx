import React from 'react';
import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

// Единственный экземпляр тостера на всё приложение.
const toaster = new Toaster();

// Через сколько миллисекунд уведомление исчезает само.
const TOAST_AUTO_HIDE_MS = 4000;

function NotifyButton() {
  const { add } = useToaster();
  const counterRef = React.useRef(0);

  const handleClick = React.useCallback(() => {
    counterRef.current += 1;
    const id = counterRef.current;

    add({
      name: `notification-${id}`,
      title: 'Уведомление',
      content: `Сообщение №${id}. Исчезнет через ${TOAST_AUTO_HIDE_MS / 1000} с.`,
      theme: 'success',
      autoHiding: TOAST_AUTO_HIDE_MS,
    });
  }, [add]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--g-spacing-6)',
        left: 'var(--g-spacing-6)',
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
      {/* Контейнер тостов; по умолчанию рендерится в правом нижнем углу экрана. */}
      <ToasterComponent />
    </ToasterProvider>
  );
}
