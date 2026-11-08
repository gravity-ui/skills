import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const toaster = new Toaster();

function ShowToastButton() {
  const { add } = useToaster();

  const handleClick = () => {
    add({
      name: 'corner-notification',
      title: 'Уведомление',
      content: 'Это всплывающее уведомление исчезнет само.',
      theme: 'success',
      autoHiding: 3000,
    });
  };

  return (
    <Button view="action" size="l" onClick={handleClick} style={{ position: 'fixed', right: 24, bottom: 24 }}>
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <ShowToastButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
