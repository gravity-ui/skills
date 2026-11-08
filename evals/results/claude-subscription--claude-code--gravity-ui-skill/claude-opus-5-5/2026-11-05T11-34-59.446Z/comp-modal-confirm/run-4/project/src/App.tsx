import * as React from 'react';
import { Button, Dialog, Flex, Text } from '@gravity-ui/uikit';

type Result = 'confirmed' | 'cancelled' | null;

export function App() {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState<Result>(null);

  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    setResult('confirmed');
    setOpen(false);
  };

  const handleCancel = () => {
    setResult('cancelled');
    setOpen(false);
  };

  return (
    <Flex direction="column" alignItems="flex-start" gap={3} style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result && (
        <Text color="secondary">
          {result === 'confirmed' ? 'Действие подтверждено' : 'Действие отменено'}
        </Text>
      )}

      <Dialog open={open} onClose={handleClose} size="s" aria-labelledby="confirm-dialog-title">
        <Dialog.Header caption="Подтверждение действия" id="confirm-dialog-title" />
        <Dialog.Body>
          <Text variant="body-1">
            Вы уверены, что хотите выполнить это действие? Отменить его будет невозможно.
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
