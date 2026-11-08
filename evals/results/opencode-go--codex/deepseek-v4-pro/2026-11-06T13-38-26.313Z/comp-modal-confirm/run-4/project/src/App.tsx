import { useState } from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <Dialog.Body>
          <Text variant="body-2">
            Вы действительно хотите выполнить это действие?
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          onClickButtonCancel={() => setOpen(false)}
          onClickButtonApply={() => setOpen(false)}
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
        />
      </Dialog>
    </div>
  );
}
