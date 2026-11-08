import { useState } from 'react';
import { Button, Dialog } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    // Здесь действие подтверждения
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть диалог
      </Button>

      <Dialog open={open} onClose={handleCancel} size="s">
        <Dialog.Header caption="Подтверждение действия" />
        <Dialog.Body>
          <div>Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.</div>
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
