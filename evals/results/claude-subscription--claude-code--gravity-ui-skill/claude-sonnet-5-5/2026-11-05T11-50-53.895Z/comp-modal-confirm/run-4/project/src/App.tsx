import React from 'react';
import { Button } from '@gravity-ui/uikit';
import { ConfirmDialog } from '@gravity-ui/components';

export function App() {
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" onClick={() => setOpen(true)}>
        Удалить элемент
      </Button>
      <ConfirmDialog
        open={open}
        onClose={close}
        title="Подтвердите действие"
        message="Вы действительно хотите удалить этот элемент? Это действие нельзя отменить."
        textButtonApply="Подтвердить"
        textButtonCancel="Отмена"
        onClickButtonApply={close}
        onClickButtonCancel={close}
        aria-label="Подтверждение действия"
      />
    </div>
  );
}
