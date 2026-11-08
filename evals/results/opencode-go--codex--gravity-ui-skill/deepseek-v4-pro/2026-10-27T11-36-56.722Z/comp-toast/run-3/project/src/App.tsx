import {
  Button,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

const toaster = new Toaster();

function CornerNotificationButton() {
  const { add } = useToaster();

  const handleClick = () => {
    add({
      name: 'corner-notification',
      title: 'Уведомление',
      content: 'Это всплывающее уведомление исчезнет автоматически.',
      theme: 'success',
      autoHiding: 3000,
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 'var(--g-spacing-6)',
        right: 'var(--g-spacing-6)',
      }}
    >
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <CornerNotificationButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
