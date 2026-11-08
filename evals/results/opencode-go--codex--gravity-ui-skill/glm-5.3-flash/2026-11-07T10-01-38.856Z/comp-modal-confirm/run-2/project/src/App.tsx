// Implement the requested feature here (and may add sibling files).
import { useState } from 'react';

import { Button, Dialog } from '@gravity-ui/uikit';

export function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => setIsDialogOpen(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="m" onClick={() => setIsDialogOpen(true)}>
        Открыть диалог
      </Button>

      <Dialog
        size="s"
        open={isDialogOpen}
        initialFocus="cancel"
        onClose={closeDialog}
        onEnterKeyDown={closeDialog}
      >
        <Dialog.Header caption="Подтверждение" />
        <Dialog.Body>
          <p>Вы подтверждаете действие? Отменить его можно только вручную.</p>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={closeDialog}
          onClickButtonCancel={closeDialog}
        />
      </Dialog>
    </div>
  );
}
