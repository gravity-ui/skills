import { useState } from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<'confirmed' | 'cancelled' | null>(null);

  const close = () => setOpen(false);

  const handleConfirm = () => {
    setResult('confirmed');
    close();
  };

  const handleCancel = () => {
    setResult('cancelled');
    close();
  };

  return (
    <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result && (
        <Text color="secondary">
          {result === 'confirmed' ? 'Действие подтверждено' : 'Действие отменено'}
        </Text>
      )}

      <Dialog
        open={open}
        onClose={handleCancel}
        size="s"
        aria-labelledby="confirm-dialog-title"
      >
        <Dialog.Header caption="Подтверждение" id="confirm-dialog-title" />
        <Dialog.Body>Вы уверены, что хотите выполнить это действие?</Dialog.Body>
        <Dialog.Footer
          onClickButtonCancel={handleCancel}
          onClickButtonApply={handleConfirm}
          textButtonCancel="Отмена"
          textButtonApply="Подтвердить"
        />
      </Dialog>
    </div>
  );
}
