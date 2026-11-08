import { useState } from 'react';
import { Button, Dialog } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      <Dialog open={open} onClose={close} size="s">
        <Dialog.Header caption="Подтверждение" />
        <Dialog.Body>
          Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отмена"
          onClickButtonApply={close}
          onClickButtonCancel={close}
        />
      </Dialog>
    </div>
  );
}
