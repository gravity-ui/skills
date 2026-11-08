import React from 'react';
import { Button, Flex, Modal, Text } from '@gravity-ui/uikit';

export function App() {
  const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);

  const closeConfirmation = React.useCallback(() => {
    setIsConfirmationOpen(false);
  }, []);

  const handleConfirm = React.useCallback(() => {
    closeConfirmation();
  }, [closeConfirmation]);

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setIsConfirmationOpen(true)}>
        Открыть подтверждение
      </Button>

      <Modal open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <Flex direction="column" gap={5} style={{ padding: 24 }}>
          <Text variant="subheader-2">Подтверждение действия</Text>
          <Text>Вы уверены, что хотите продолжить? Это действие нельзя отменить.</Text>
          <Flex justifyContent="flex-end" gap={3}>
            <Button view="flat" onClick={closeConfirmation}>
              Отменить
            </Button>
            <Button view="action" onClick={handleConfirm}>
              Подтвердить
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </Flex>
  );
}
