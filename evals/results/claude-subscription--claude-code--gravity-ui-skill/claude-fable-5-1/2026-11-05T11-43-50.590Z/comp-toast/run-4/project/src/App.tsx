import {Button, Flex, Text, Toaster, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';

// Single toaster instance for the whole app (see Toaster.Provider in uikit docs).
const toaster = new Toaster();

// Toast disappears on its own after this delay (uikit default is 5000 ms).
const TOAST_AUTO_HIDE_MS = 4000;

function NotifyButton() {
  const {add} = useToaster();

  const handleClick = () => {
    add({
      // Unique name per toast so repeated clicks stack instead of replacing one another.
      name: `notification-${Date.now()}`,
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
        <Text variant="header-1">Toast demo</Text>
        <Text variant="body-1" color="secondary">
          Нажмите на кнопку — в правом нижнем углу экрана появится уведомление, которое исчезнет
          само через несколько секунд.
        </Text>
        <div>
          <NotifyButton />
        </div>
      </Flex>
      {/* Renders the toast list in a portal, fixed to the screen corner. */}
      <ToasterComponent />
    </ToasterProvider>
  );
}
