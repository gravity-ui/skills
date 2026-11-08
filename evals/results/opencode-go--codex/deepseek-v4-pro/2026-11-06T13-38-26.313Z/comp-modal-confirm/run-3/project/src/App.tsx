import React from 'react';
import { Button, Dialog } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        onEnterKeyDown={() => {
          alert('Подтверждено');
          setOpen(false);
        }}
      >
        <Dialog.Header caption="Подтверждение" />
        <Dialog.Body>
          <p>Вы действительно хотите выполнить это действие?</p>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={() => {
            alert('Подтверждено');
            setOpen(false);
          }}
          onClickButtonCancel={() => setOpen(false)}
        />
      </Dialog>
    </div>
  );
}
