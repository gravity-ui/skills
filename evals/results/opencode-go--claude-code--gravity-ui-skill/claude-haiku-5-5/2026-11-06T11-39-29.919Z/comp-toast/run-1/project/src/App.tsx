import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const TOAST_AUTO_HIDING_MS = 3000;

// Один экземпляр на приложение: ToasterProvider получает его, useToaster отдаёт API детям.
const toaster = new Toaster();

// Счётчик даёт каждому тосту уникальное имя, иначе повторный клик заменял бы уже показанный тост.
let toastCounter = 0;

function ShowToastButton() {
  const { add } = useToaster();

  const handleClick = () => {
    toastCounter += 1;
    add({
      name: `toast-${toastCounter}`,
      title: 'Уведомление',
      content: 'Кнопка была нажата',
      theme: 'info',
      autoHiding: TOAST_AUTO_HIDING_MS,
    });
  };

  return (
    <Button view="action" size="l" onClick={handleClick}>
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <div
        style={{
          position: 'fixed',
          top: 'var(--g-spacing-6)',
          right: 'var(--g-spacing-6)',
        }}
      >
        <ShowToastButton />
      </div>
      <ToasterComponent />
    </ToasterProvider>
  );
}
