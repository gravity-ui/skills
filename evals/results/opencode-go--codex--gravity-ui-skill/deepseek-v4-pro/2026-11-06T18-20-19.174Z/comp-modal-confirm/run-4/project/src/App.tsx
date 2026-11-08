import {useState} from 'react';
import {Button, Dialog, Text} from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{padding: 24}}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="s"
      >
        <Dialog.Header caption="Подтверждение" />
        <Dialog.Body>
          <Text variant="body-2">Вы уверены, что хотите продолжить?</Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonCancel="Отменить"
          textButtonApply="Подтвердить"
          onClickButtonCancel={() => setOpen(false)}
          onClickButtonApply={() => setOpen(false)}
        />
      </Dialog>
    </div>
  );
}
