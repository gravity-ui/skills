import React from 'react';
import { Box, Button } from '@gravity-ui/uikit';
import { ConfirmDialog } from '@gravity-ui/components';

export function App() {
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  return (
    <Box spacing={{ p: 6 }}>
      <Button view="action" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      <ConfirmDialog
        open={open}
        onClose={close}
        title="Подтверждение"
        message="Вы уверены, что хотите выполнить это действие?"
        textButtonApply="Подтвердить"
        textButtonCancel="Отмена"
        onClickButtonApply={close}
        onClickButtonCancel={close}
      />
    </Box>
  );
}
