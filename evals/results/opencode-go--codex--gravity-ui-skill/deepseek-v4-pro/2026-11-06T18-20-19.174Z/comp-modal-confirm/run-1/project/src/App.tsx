import {useState} from 'react';
import {Button, Dialog} from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{padding: 24}}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть
      </Button>

      <Dialog
        open={open}
        onClose={(_event, reason) => {
          if (reason !== 'closeButtonClick') setOpen(false);
        }}
        onOpenChange={(newOpen) => setOpen(newOpen)}
        hasCloseButton={false}
      >
        <Dialog.Header caption="Подтверждение действия" />
        <Dialog.Body>
          <p>Вы уверены, что хотите выполнить это действие?</p>
        </Dialog.Body>
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
