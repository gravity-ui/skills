import { Button, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton';

function CornerButton() {
  const { add } = useToaster();

  const showToast = () => {
    add({
      name: `toast-${Date.now()}`,
      title: 'Уведомление',
      content: 'Это всплывающее уведомление скоро исчезнет само.',
      theme: 'info',
      autoHiding: 4000, // исчезнет автоматически через 4 секунды
    });
  };

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24 }}>
      <Button view="action" size="l" onClick={showToast}>
        Показать уведомление
      </Button>
    </div>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ padding: 24 }}>
        <h1>Демо уведомлений</h1>
        <p>Нажмите кнопку в правом нижнем углу экрана.</p>
      </div>
      <CornerButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
