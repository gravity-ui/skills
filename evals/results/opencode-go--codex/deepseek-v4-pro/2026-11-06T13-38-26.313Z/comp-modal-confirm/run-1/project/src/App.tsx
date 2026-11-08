import { useState, useCallback } from 'react';
import { Button, Dialog } from '@gravity-ui/uikit';

// Implement the requested feature here (and may add sibling files).
export function App() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleConfirm = useCallback(() => {
    // Действие при подтверждении
    setOpen(false);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={handleOpen}>
        Открыть
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <Dialog.Header caption="Подтверждение" />
        <Dialog.Body>
          Вы уверены, что хотите выполнить это действие? Пожалуйста, подтвердите
          или отмените операцию.
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleClose}
          propsButtonApply={{
            view: 'action',
          }}
          propsButtonCancel={{
            view: 'normal',
          }}
        />
      </Dialog>
    </div>
  );
}
