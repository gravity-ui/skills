import React from 'react';
import { Button, Flex, Modal, Text } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>
      <Modal open={open} onOpenChange={(newOpen) => setOpen(newOpen)}>
        <Flex direction="column" gap={4}>
          <Text variant="subheader-2">Подтверждение</Text>
          <Text variant="body-2">
            Вы уверены, что хотите выполнить это действие? Пожалуйста,
            подтвердите или отмените операцию.
          </Text>
          <Flex gap={2}>
            <Button view="action" onClick={() => setOpen(false)}>
              Подтвердить
            </Button>
            <Button view="normal" onClick={() => setOpen(false)}>
              Отменить
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </div>
  );
}
