import React from 'react';
import {Button, Dialog, Text} from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState<'confirmed' | 'cancelled' | null>(null);

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
    <div style={{padding: 24}}>
      <Button view="action" onClick={() => setOpen(true)}>
        Удалить проект
      </Button>

      {result && (
        <div style={{marginTop: 'var(--g-spacing-4)'}}>
          <Text color="secondary">
            {result === 'confirmed' ? 'Действие подтверждено' : 'Действие отменено'}
          </Text>
        </div>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        size="s"
        aria-labelledby="confirm-dialog-title"
      >
        <Dialog.Header caption="Подтвердите действие" id="confirm-dialog-title" />
        <Dialog.Body>
          Вы уверены, что хотите удалить проект? Это действие нельзя отменить.
        </Dialog.Body>
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
