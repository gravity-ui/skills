import * as React from 'react';
import {Button, Dialog, Text} from '@gravity-ui/uikit';

const TITLE_ID = 'confirm-dialog-title';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setOpen(false);
  };

  return (
    <div style={{padding: 24}}>
      <Button view="action" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {confirmed && (
        <Text as="div" color="secondary" style={{marginTop: 'var(--g-spacing-4)'}}>
          Действие подтверждено
        </Text>
      )}

      <Dialog open={open} onClose={handleClose} size="s" aria-labelledby={TITLE_ID}>
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
          onClickButtonCancel={handleClose}
        />
      </Dialog>
    </div>
  );
}
