import {useCallback} from 'react';
import {Button, Text, Toaster, ToasterProvider, useToaster} from '@gravity-ui/uikit';

const TOAST_TIMEOUT = 4000;

const toaster = new Toaster();

function CornerButton() {
  const {add} = useToaster();

  const showToast = useCallback(() => {
    add({
      // Уникальное имя — каждый клик добавляет новый тост, они складываются стопкой
      name: `corner-toast-${Date.now()}`,
      title: 'Уведомление',
      content: `Это всплывающее уведомление. Оно исчезнет само через ${TOAST_TIMEOUT / 1000} секунды.`,
      autoHiding: TOAST_TIMEOUT,
    });
  }, [add]);

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
      <div style={{padding: 24}}>
        <Text variant="header-1">Всплывающие уведомления</Text>
        <Text variant="body-2" color="secondary" as="p">
          Нажмите кнопку в правом нижнем углу экрана — появится уведомление, которое само
          исчезнет через несколько секунд.
        </Text>
        <CornerButton />
      </div>
    </ToasterProvider>
  );
}
