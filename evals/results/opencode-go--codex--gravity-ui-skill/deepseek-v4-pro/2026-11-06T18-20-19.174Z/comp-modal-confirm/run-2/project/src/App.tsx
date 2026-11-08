import { useState } from 'react';
import { Button, Dialog } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть модальное окно
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        onOpenChange={(nextOpen) => setOpen(nextOpen)}
        size="s"
      >
        <Dialog.Header caption="Подтверждение" />
        <Dialog.Body>Вы действительно хотите продолжить?</Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={() => setOpen(false)}
          onClickButtonCancel={() => setOpen(false)}
        />
      </Dialog>
    </div>
  );
}
