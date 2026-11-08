import { useState } from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<'confirmed' | 'cancelled' | null>(null);

  const handleConfirm = () => {
    setResult('confirmed');
    setOpen(false);
  };

  const handleCancel = () => {
    setResult('cancelled');
    setOpen(false);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result && (
        <Text color={result === 'confirmed' ? 'positive' : 'secondary'}>
          {result === 'confirmed' ? 'Действие подтверждено' : 'Действие отменено'}
        </Text>
      )}

      <Dialog
        open={open}
        onClose={handleCancel}
        size="s"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-text"
        initialFocus="cancel"
      >
        <Dialog.Header id="confirm-dialog-title" caption="Подтверждение действия" />
        <Dialog.Body>
          <Text id="confirm-dialog-text">
            Вы уверены, что хотите выполнить это действие? Отменить его после подтверждения будет нельзя.
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
          preset="default"
        />
      </Dialog>
    </div>
  );
}
