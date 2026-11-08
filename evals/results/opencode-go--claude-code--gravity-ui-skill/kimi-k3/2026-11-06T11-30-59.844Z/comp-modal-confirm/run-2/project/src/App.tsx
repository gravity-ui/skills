import {useState} from 'react';
import {Button, Dialog} from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div style={{padding: 24}}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть диалог
      </Button>

      <Dialog open={open} onClose={handleCancel} hasCloseButton aria-label="Подтверждение действия">
        <Dialog.Header caption="Подтвердите действие" />
        <Dialog.Body>
          Вы уверены, что хотите продолжить? Это действие можно будет отменить только через
          поддержку.
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отмена"
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
