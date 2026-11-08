import { useState } from 'react';
import { Button, Flex, Modal, Text } from '@gravity-ui/uikit';

export function App() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setIsConfirmOpen(true)}>
        Открыть подтверждение
      </Button>

      <Modal
        open={isConfirmOpen}
        onOpenChange={(open) => setIsConfirmOpen(open)}
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
      >
        <Flex direction="column" gap={4} style={{ width: 360, padding: 24 }}>
          <Text id="confirmation-title" variant="header-2">
            Подтвердите действие
          </Text>
          <Text id="confirmation-description" variant="body-2">
            Это текст модального окна. Нажмите «Подтвердить», чтобы продолжить, или «Отменить», чтобы закрыть окно.
          </Text>

          <Flex gap={2} justifyContent="flex-end" style={{ flexShrink: 0 }}>
            <Button view="flat" size="m" onClick={() => setIsConfirmOpen(false)}>
              Отменить
            </Button>
            <Button view="action" size="m" onClick={() => setIsConfirmOpen(false)}>
              Подтвердить
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </div>
  );
}
