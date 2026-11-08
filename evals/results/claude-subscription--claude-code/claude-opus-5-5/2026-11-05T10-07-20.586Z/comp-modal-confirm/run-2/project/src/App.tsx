import { useState } from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

const DIALOG_TITLE_ID = 'confirm-dialog-title';

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
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
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
        aria-labelledby={DIALOG_TITLE_ID}
        initialFocus="apply"
      >
        <Dialog.Header caption="Подтверждение действия" id={DIALOG_TITLE_ID} />
        <Dialog.Body>
          <Text>Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.</Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
