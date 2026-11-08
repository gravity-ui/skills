import { useState } from 'react';
import { Button, Dialog } from '@gravity-ui/uikit';

export function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => setIsDialogOpen(false);

  const handleConfirm = () => {
    closeDialog();
  };

  return (
    <div style={{ padding: 24 }}>
      <Button view="normal" size="m" onClick={() => setIsDialogOpen(true)}>
        Открыть окно
      </Button>

      <Dialog
        open={isDialogOpen}
        onClose={closeDialog}
        size="s"
        aria-label="Подтверждение действия"
        aria-describedby="confirm-dialog-description"
      >
        <Dialog.Header caption="Подтверждение" />
        <Dialog.Body>
          <div id="confirm-dialog-description">Здесь находится нужный текст.</div>
        </Dialog.Body>
        <Dialog.Footer
          onClickButtonCancel={closeDialog}
          onClickButtonApply={handleConfirm}
          textButtonCancel="Отменить"
          textButtonApply="Подтвердить"
        />
      </Dialog>
    </div>
  );
}
