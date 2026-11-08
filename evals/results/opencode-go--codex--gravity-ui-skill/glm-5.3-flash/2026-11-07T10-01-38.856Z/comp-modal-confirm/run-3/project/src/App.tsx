import React, { useState } from 'react';
import { Button, Dialog } from '@gravity-ui/uikit';

export function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="m" onClick={() => setIsDialogOpen(true)}>
        Открыть окно
      </Button>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onOpenChange={setIsDialogOpen}
        size="s"
      >
        <Dialog.Header caption="Подтверждение действия" />
        <Dialog.Body>
          Вы действительно хотите выполнить это действие?
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={() => setIsDialogOpen(false)}
          onClickButtonCancel={() => setIsDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
}
