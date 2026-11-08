import { useState } from 'react';

import { Button, Dialog, Text } from '@gravity-ui/uikit';

const DIALOG_TITLE_ID = 'confirm-dialog-title';

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setOpen(false);
  };

  const handleCancel = () => {
    setConfirmed(false);
    setOpen(false);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Button view="action" size="l" onClick={handleOpen}>
        Удалить проект
      </Button>

      {confirmed ? (
        <Text color="positive">Действие подтверждено.</Text>
      ) : null}

      <Dialog
        open={open}
        onClose={handleClose}
        onEnterKeyDown={handleConfirm}
        size="s"
        aria-labelledby={DIALOG_TITLE_ID}
      >
        <Dialog.Header caption="Подтвердите действие" id={DIALOG_TITLE_ID} />
        <Dialog.Body>
          Вы действительно хотите удалить проект? Это действие нельзя будет отменить.
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
