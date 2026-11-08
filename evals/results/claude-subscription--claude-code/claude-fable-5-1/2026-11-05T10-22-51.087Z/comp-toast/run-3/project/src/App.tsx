import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

// Единый экземпляр тостера на всё приложение.
const toaster = new Toaster();

// Через сколько миллисекунд уведомление исчезнет само.
const TOAST_AUTO_HIDE_MS = 4000;

function NotifyButton() {
  const { add } = useToaster();

  const handleClick = () => {
    add({
      // Уникальное имя, чтобы каждый клик показывал отдельное уведомление,
      // а не обновлял уже открытое.
      name: `notification-${Date.now()}`,
      title: 'Уведомление',
      content: 'Это всплывающее уведомление исчезнет само через несколько секунд.',
      theme: 'info',
      autoHiding: TOAST_AUTO_HIDE_MS,
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={handleClick}
      style={{ position: 'fixed', right: 24, bottom: 24 }}
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
