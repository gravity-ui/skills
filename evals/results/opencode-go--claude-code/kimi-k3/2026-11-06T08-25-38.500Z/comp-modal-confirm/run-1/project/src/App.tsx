import { useState } from 'react';
import { Button, Dialog } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setOpen(false);
  };

  const handleCancel = () => {
    setConfirmed(false);
    setOpen(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      <Dialog open={open} onClose={handleCancel} aria-labelledby="confirm-dialog-title">
        <Dialog.Header id="confirm-dialog-title" caption="Подтверждение действия" />
        <Dialog.Body>
          Вы действительно хотите выполнить это действие? Оно будет применено сразу после
          подтверждения.
        </Dialog.Body>
        <Dialog.Footer
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
          textButtonApply="Подтвердить"
          textButtonCancel="Отмена"
        />
      </Dialog>

      {confirmed && <p style={{ marginTop: 16 }}>Действие подтверждено ✅</p>}
    </div>
  );
}
