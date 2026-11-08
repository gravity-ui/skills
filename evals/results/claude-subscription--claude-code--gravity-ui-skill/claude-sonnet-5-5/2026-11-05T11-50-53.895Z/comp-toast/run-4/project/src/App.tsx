import {Button, Toaster, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';

const toaster = new Toaster();

function ToastButton() {
  const {add} = useToaster();

  const showToast = () => {
    add({
      name: 'action-toast',
      title: 'Готово',
      content: 'Действие выполнено успешно',
      theme: 'success',
      autoHiding: 3000,
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={showToast}
      style={{position: 'fixed', right: 24, bottom: 24}}
    >
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <ToastButton />
      <ToasterComponent />
    </ToasterProvider>
  );
}
