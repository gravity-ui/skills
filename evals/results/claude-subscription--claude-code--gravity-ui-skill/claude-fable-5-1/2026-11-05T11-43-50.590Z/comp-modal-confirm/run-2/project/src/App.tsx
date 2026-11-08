import * as React from 'react';
import { Button, Dialog, Flex, Text } from '@gravity-ui/uikit';

type Result = 'confirmed' | 'cancelled' | null;

export function App() {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState<Result>(null);

  const handleConfirm = () => {
    setResult('confirmed');
    setOpen(false);
  };

  const handleCancel = () => {
    setResult('cancelled');
    setOpen(false);
  };

  return (
    <Flex direction="column" gap={3} alignItems="flex-start" style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result !== null && (
        <Text variant="body-1" color="secondary">
          {result === 'confirmed' ? 'Действие подтверждено' : 'Действие отменено'}
        </Text>
      )}

      <Dialog
        open={open}
        onClose={handleCancel}
        size="s"
        initialFocus="apply"
        aria-labelledby="confirm-dialog-title"
      >
        <Dialog.Header id="confirm-dialog-title" caption="Подтверждение действия" />
        <Dialog.Body>
          <Text variant="body-1">
            Вы уверены, что хотите выполнить это действие? Его нельзя будет отменить.
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
        />
      </Dialog>
    </Flex>
  );
}
