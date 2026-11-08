import { Button, ToasterComponent, ToasterProvider } from '@gravity-ui/uikit';
import { Toaster } from '@gravity-ui/uikit';

const toaster = new Toaster();

export function App() {
  const handleClick = () => {
    toaster.add({
      name: 'demo-toast',
      title: 'Уведомление',
      content: 'Это всплывающее уведомление, которое исчезнет само.',
      autoHiding: 3000,
    });
  };

  return (
    <ToasterProvider toaster={toaster}>
      <div style={{ padding: 24, minHeight: '100vh', position: 'relative' }}>
        <Button
          view="action"
          size="l"
          onClick={handleClick}
          style={{ position: 'fixed', bottom: 24, right: 24 }}
        >
          Показать уведомление
        </Button>
        <ToasterComponent />
      </div>
    </ToasterProvider>
  );
}
