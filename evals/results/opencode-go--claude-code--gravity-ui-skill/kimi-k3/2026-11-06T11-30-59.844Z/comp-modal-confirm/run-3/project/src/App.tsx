import React from 'react';
import { Button, Flex, Modal, Text } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <Flex direction="column" gap={4} style={{ padding: 24, minWidth: 320 }}>
          <Text variant="subheader-2">Подтверждение действия</Text>
          <Text variant="body-1" color="secondary">
            Вы уверены, что хотите выполнить это действие? Его нельзя будет отменить.
          </Text>
          <Flex gap={3} justifyContent="flex-end">
            <Button view="flat" size="l" onClick={handleCancel}>
              Отмена
            </Button>
            <Button view="action" size="l" onClick={handleConfirm}>
              Подтвердить
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </div>
  );
}
