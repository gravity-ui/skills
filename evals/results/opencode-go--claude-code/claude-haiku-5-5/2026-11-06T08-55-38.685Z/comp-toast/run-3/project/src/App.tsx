import { Button, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton';

const AUTO_HIDE_MS = 4000;

let toastId = 0;

function NotifyButton() {
  const { add } = useToaster();

  const handleClick = () => {
    // Each toast needs a unique name, otherwise a repeated name replaces the existing toast.
    toastId += 1;
    add({
      name: `notification-${toastId}`,
      title: 'Уведомление',
      content: 'Это всплывающее уведомление. Оно скроется само через несколько секунд.',
      theme: 'info',
      autoHiding: AUTO_HIDE_MS,
    });
  };

  return (
    // Top-right corner: toasts are anchored bottom-right, so they never cover this button.
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1 }}>
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
      <ToasterComponent />
    </ToasterProvider>
  );
}
