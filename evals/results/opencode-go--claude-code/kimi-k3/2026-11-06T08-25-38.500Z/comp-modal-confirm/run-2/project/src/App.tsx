import { useState } from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const closeDialog = () => setOpen(false);

  const handleConfirm = () => {
    setConfirmed(true);
    closeDialog();
  };

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
      }}
    >
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {confirmed && <Text color="positive">Действие подтверждено ✅</Text>}

      <Dialog open={open} onClose={closeDialog}>
        <Dialog.Header caption="Подтвердите действие" />
        <Dialog.Body>
          Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отмена"
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={closeDialog}
        />
      </Dialog>
    </div>
  );
}
