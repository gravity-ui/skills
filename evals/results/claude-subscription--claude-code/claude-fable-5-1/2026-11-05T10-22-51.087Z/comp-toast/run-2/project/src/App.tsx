import { useCallback, useRef } from 'react';
import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

/** Через сколько миллисекунд уведомление исчезнет само. */
const TOAST_AUTO_HIDE_MS = 4000;

/** Один экземпляр Toaster на приложение: хранит список активных уведомлений. */
const toaster = new Toaster();

function NotifyButton() {
  const { add } = useToaster();
  const counterRef = useRef(0);

  const showNotification = useCallback(() => {
    counterRef.current += 1;
    add({
      // Уникальное имя — чтобы повторные клики создавали новые тосты, а не обновляли один.
      name: `notification-${counterRef.current}`,
      title: 'Уведомление',
      content: 'Действие выполнено. Это сообщение закроется автоматически.',
      theme: 'success',
      autoHiding: TOAST_AUTO_HIDE_MS,
      isClosable: true,
    });
  }, [add]);

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24 }}>
      <Button view="action" size="l" onClick={showNotification}>
        Показать уведомление
      </Button>
    </div>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ padding: 24 }}>
        <p>Нажмите кнопку в правом нижнем углу экрана, чтобы показать всплывающее уведомление.</p>
      </div>
      <NotifyButton />
      {/* Контейнер, в котором рендерятся тосты (в портале, в углу экрана). */}
      <ToasterComponent />
    </ToasterProvider>
  );
}
