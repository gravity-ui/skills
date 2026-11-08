import {useRef} from 'react';
import {Button, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

const TOAST_AUTO_HIDING_MS = 3000;

function NotifyButton() {
  const {add} = useToaster();
  const counterRef = useRef(0);

  const handleClick = () => {
    counterRef.current += 1;
    add({
      // The name must be unique, otherwise a toast with the same name is not added again.
      name: `notification-${counterRef.current}`,
      title: 'Уведомление',
      content: 'Действие выполнено успешно',
      theme: 'success',
      autoHiding: TOAST_AUTO_HIDING_MS,
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
