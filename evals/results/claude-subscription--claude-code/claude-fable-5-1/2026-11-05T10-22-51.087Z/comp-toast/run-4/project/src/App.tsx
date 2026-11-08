import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

// Один экземпляр тостера на всё приложение.
const toaster = new Toaster();

// Время, через которое уведомление исчезает само (мс).
const TOAST_AUTO_HIDE_MS = 4000;

function NotifyButton() {
  const { add } = useToaster();

  const showToast = () => {
    add({
      // Уникальное имя, чтобы повторные клики показывали отдельные уведомления.
      name: `notification-${Date.now()}`,
      title: 'Уведомление',
      content: 'Действие выполнено успешно.',
      theme: 'success',
      autoHiding: TOAST_AUTO_HIDE_MS,
    });
  };

  return (
    <Button view="action" size="l" onClick={showToast}>
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ padding: 24 }}>
        <NotifyButton />
      </div>
      {/* Рендерит всплывающие уведомления в углу экрана (position: fixed). */}
      <ToasterComponent />
    </ToasterProvider>
  );
}
