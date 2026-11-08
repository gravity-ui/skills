import { useState } from 'react';
import { Button, Dialog } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleConfirm = () => {
    setOpen(false);
    setResult('Действие подтверждено');
  };

  const handleCancel = () => {
    setOpen(false);
    setResult('Действие отменено');
  };

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result && <div style={{ marginTop: 16 }}>{result}</div>}

      <Dialog open={open} onClose={handleCancel} size="s">
        <Dialog.Header caption="Подтверждение" />
        <Dialog.Body>Вы уверены, что хотите выполнить это действие?</Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
