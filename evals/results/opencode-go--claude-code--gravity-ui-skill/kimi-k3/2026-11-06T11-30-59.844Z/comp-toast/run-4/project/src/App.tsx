import {
  Button,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

const toaster = new Toaster();

function CornerButton() {
  const {add} = useToaster();

  const showToast = () => {
    add({
      name: `toast-${Date.now()}`,
      title: 'Готово!',
      content: 'Кнопка нажата. Это уведомление исчезнет само.',
      theme: 'success',
      autoHiding: 5000,
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={showToast}
      style={{position: 'fixed', right: 24, bottom: 24, zIndex: 1}}
    >
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <CornerButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
