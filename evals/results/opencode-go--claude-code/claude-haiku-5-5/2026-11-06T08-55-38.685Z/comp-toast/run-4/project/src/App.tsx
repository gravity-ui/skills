import * as React from 'react';
import {
  Button,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

// Одна общая очередь уведомлений на всё приложение.
const toaster = new Toaster();

const AUTO_HIDING_MS = 4000;

function NotifyButton() {
  const { add } = useToaster();
  const clickCount = React.useRef(0);

  const handleClick = () => {
    clickCount.current += 1;
    add({
      // Уникальное имя, чтобы каждый клик создавал отдельное уведомление.
      name: `notification-${clickCount.current}`,
      title: 'Уведомление',
      content: `Кнопка нажата ${clickCount.current} раз(а)`,
      theme: 'info',
      autoHiding: AUTO_HIDING_MS,
    });
  };

  return (
    <div style={{ position: 'fixed', top: 16, right: 16 }}>
      <Button view="action" size="l" onClick={handleClick}>
        Показать уведомление
      </Button>
    </div>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ padding: 24 }}>
        <NotifyButton />
      </div>
      <ToasterComponent />
    </ToasterProvider>
  );
}
