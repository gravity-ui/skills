import { useState } from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

export function App() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const closeModal = () => setIsConfirmOpen(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setIsConfirmOpen(true)}>
        Открыть подтверждение
      </Button>

      <Dialog
        open={isConfirmOpen}
        onClose={closeModal}
        onEnterKeyDown={() => {
          closeModal();
        }}
        size="s"
      >
        <Dialog.Header caption="Подтверждение" />
        <Dialog.Body>
          <Text as="p">Текст подтверждения действия.</Text>
        </Dialog.Body>
        <Dialog.Footer
          onClickButtonApply={() => { closeModal(); }}
          onClickButtonCancel={closeModal}
          textButtonCancel="Отменить"
          textButtonApply="Подтвердить"
        />
      </Dialog>
    </div>
  );
}
