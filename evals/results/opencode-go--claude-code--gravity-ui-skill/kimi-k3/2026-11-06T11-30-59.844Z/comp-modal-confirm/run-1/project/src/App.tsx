import React from 'react';
import {Box, Button, Dialog, Text} from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Box spacing={{p: 6}}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть диалог
      </Button>

      <Dialog open={open} onClose={handleCancel} size="s">
        <Dialog.Header caption="Подтверждение действия" />
        <Dialog.Body>
          <Text>
            Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
          textButtonApply="Подтвердить"
          textButtonCancel="Отмена"
        />
      </Dialog>
    </Box>
  );
}
