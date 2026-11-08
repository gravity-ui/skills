import React from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

const TITLE_ID = 'confirm-dialog-title';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState<'confirmed' | 'cancelled' | null>(null);

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
    <div style={{ padding: 24 }}>
      <Button view="action" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result && (
        <div style={{ marginTop: 16 }}>
          <Text variant="body-1" color="secondary">
            {result === 'confirmed' ? 'Действие подтверждено' : 'Действие отменено'}
          </Text>
        </div>
      )}

      <Dialog
        open={open}
        onClose={close}
        size="s"
        aria-labelledby={TITLE_ID}
      >
        <Dialog.Header caption="Подтверждение действия" id={TITLE_ID} />
        <Dialog.Body>
          <Text variant="body-1">
            Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отмена"
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
