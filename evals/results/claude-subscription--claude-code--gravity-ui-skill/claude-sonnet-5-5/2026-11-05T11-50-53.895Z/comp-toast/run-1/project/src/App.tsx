import {useRef} from 'react';
import {Button, Toaster, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';

const toaster = new Toaster();

const AUTO_HIDING_MS = 5000;

function NotifyButton() {
  const {add} = useToaster();
  const counter = useRef(0);

  const handleClick = () => {
    counter.current += 1;
    add({
      // `name` must be unique among visible toasts
      name: `notification-${counter.current}`,
      title: 'Готово',
      content: 'Уведомление исчезнет автоматически.',
      theme: 'success',
      autoHiding: AUTO_HIDING_MS,
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={handleClick}
      style={{position: 'fixed', top: 'var(--g-spacing-4)', right: 'var(--g-spacing-4)'}}
    >
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <NotifyButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
