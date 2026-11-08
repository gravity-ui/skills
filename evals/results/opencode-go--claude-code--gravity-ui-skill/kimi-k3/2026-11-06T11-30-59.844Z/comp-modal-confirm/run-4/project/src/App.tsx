import {useState} from 'react';
import {Button, Dialog} from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    // Здесь выполняется подтверждаемое действие
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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="s"
        aria-label="Подтверждение действия"
      >
        <Dialog.Header caption="Подтверждение действия" />
        <Dialog.Body>
          Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.
        </Dialog.Body>
        <Dialog.Footer
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
          textButtonApply="Подтвердить"
          textButtonCancel="Отмена"
        />
      </Dialog>
    </div>
  );
}
