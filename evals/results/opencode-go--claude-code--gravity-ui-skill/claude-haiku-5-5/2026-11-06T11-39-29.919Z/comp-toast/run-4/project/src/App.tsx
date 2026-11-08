import {Button, Toaster, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';

// Один общий экземпляр тостера на приложение: ToasterProvider подписывается на него,
// ToasterComponent рисует уведомления, а useToaster даёт методы для добавления.
const toaster = new Toaster();

let toastCounter = 0;

function NotifyButton() {
  const {add} = useToaster();

  const handleClick = () => {
    // name должен быть уникальным, иначе тост с таким именем будет проигнорирован.
    toastCounter += 1;
    add({
      name: `notification-${toastCounter}`,
      title: 'Уведомление',
      content: 'Кнопка была нажата',
      theme: 'success',
      autoHiding: 3000, // исчезает сам через 3 секунды
    });
  };

  return (
    <Button
      view="action"
      size="l"
      onClick={handleClick}
      style={{
        position: 'fixed',
        right: 'var(--g-spacing-6)',
        bottom: 'var(--g-spacing-6)',
      }}
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
