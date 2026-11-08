import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const toaster = new Toaster();

const TOAST_NAME = 'action-toast';
const TOAST_HIDE_DELAY_MS = 3000;

function NotifyButton() {
  const { add, has, update } = useToaster();

  const handleClick = () => {
    const toast = {
      name: TOAST_NAME,
      title: 'Готово',
      content: 'Уведомление исчезнет само через несколько секунд',
      theme: 'success' as const,
      autoHiding: TOAST_HIDE_DELAY_MS,
    };

    // Повторный клик не создаёт дубликат (имя тоста уникально) — обновляем существующий.
    if (has(TOAST_NAME)) {
      update(TOAST_NAME, toast);
    } else {
      add(toast);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 'var(--g-spacing-4)', right: 'var(--g-spacing-4)' }}>
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
