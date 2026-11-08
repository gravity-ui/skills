import { useRef } from 'react';
import {
  Button,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

const AUTO_HIDE_MS = 3000;

const toaster = new Toaster();

function ToastButton() {
  const { add } = useToaster();
  const counter = useRef(0);

  const showToast = () => {
    counter.current += 1;
    add({
      // Уникальное имя, чтобы повторные клики создавали новые уведомления
      name: `notification-${counter.current}`,
      title: 'Готово',
      content: 'Уведомление исчезнет само через несколько секунд',
      theme: 'success',
      autoHiding: AUTO_HIDE_MS,
      isClosable: true,
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
        <ToastButton />
      </div>
      <ToasterComponent />
    </ToasterProvider>
  );
}
