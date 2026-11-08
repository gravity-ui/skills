import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

import './App.css';

const toaster = new Toaster();

let toastCounter = 0;

function CornerButton() {
  const { add } = useToaster();

  const handleClick = () => {
    toastCounter += 1;
    add({
      name: `corner-toast-${toastCounter}`,
      title: 'Готово!',
      content: 'Это уведомление исчезнет само через несколько секунд',
      theme: 'success',
    });
  };

  return (
    <Button className="app-corner-button" view="action" size="l" onClick={handleClick}>
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
