import {Button, Flex, Text, Toaster, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';

// A single toaster instance shared by the whole app.
const toaster = new Toaster();

// Toast auto-hides after this many milliseconds.
const TOAST_AUTO_HIDE_MS = 4000;

function ShowToastButton() {
  const {add} = useToaster();

  const handleClick = () => {
    add({
      // A unique name per call lets repeated clicks stack several toasts
      // instead of replacing the one that is already visible.
      name: `demo-toast-${Date.now()}`,
      title: 'Уведомление',
      content: 'Действие выполнено успешно.',
      theme: 'success',
      autoHiding: TOAST_AUTO_HIDE_MS,
      isClosable: true,
    });
  };

  return (
    <Button view="action" size="l" onClick={handleClick}>
      Показать уведомление
    </Button>
  );
}

export function App() {
  return (
    <ToasterProvider toaster={toaster}>
      <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
        <Text variant="header-1">Всплывающие уведомления</Text>
        <Text variant="body-1" color="secondary">
          Нажмите на кнопку — в углу экрана появится уведомление, которое само исчезнет через несколько
          секунд.
        </Text>
        <div>
          <ShowToastButton />
        </div>
      </Flex>
      {/* Renders the toast stack in the corner of the viewport (via a portal). */}
      <ToasterComponent />
    </ToasterProvider>
  );
}
