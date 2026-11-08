import React from 'react';
import {Button, Dialog, Flex, Text} from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setOpen(false);
  };

  return (
    <Flex direction="column" gap={3} style={{padding: 'var(--g-spacing-6)'}}>
      <div>
        <Button view="action" size="l" onClick={() => setOpen(true)}>
          Открыть окно
        </Button>
      </div>

      {confirmed && (
        <Text variant="body-1" color="positive">
          Действие подтверждено
        </Text>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        size="s"
        aria-labelledby="confirm-dialog-title"
        initialFocus="cancel"
      >
        <Dialog.Header id="confirm-dialog-title" caption="Подтверждение" />
        <Dialog.Body>
          <Text variant="body-1">
            Вы уверены, что хотите выполнить это действие? Отменить его будет нельзя.
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleClose}
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
        />
      </Dialog>
    </Flex>
  );
}
