import { useRef, useState } from 'react';
import {
  Button,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

const TOAST_AUTO_HIDING_MS = 4000;

function NotifyCorner() {
  const toaster = useToaster();
  const counter = useRef(0);

  const handleClick = () => {
    counter.current += 1;
    toaster.add({
      name: `notification-${counter.current}`,
      title: 'Уведомление',
      content: `Кнопка нажата ${counter.current} раз(а)`,
      theme: 'info',
      autoHiding: TOAST_AUTO_HIDING_MS,
    });
  };

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24 }}>
      <Button view="action" size="l" onClick={handleClick}>
        Показать уведомление
      </Button>
    </div>
  );
}

export function App() {
  const [toaster] = useState(() => new Toaster());

  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ padding: 24 }} />
      <NotifyCorner />
      <ToasterComponent />
    </ToasterProvider>
  );
}
