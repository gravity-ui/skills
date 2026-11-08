import { useState } from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

const DIALOG_TITLE_ID = 'confirm-dialog-title';

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleConfirm = () => {
    setResult('Действие подтверждено');
    setOpen(false);
  };

  const handleCancel = () => {
    setResult('Действие отменено');
    setOpen(false);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result && <Text color="secondary">{result}</Text>}

      <Dialog
        open={open}
        onClose={handleCancel}
        size="s"
        aria-labelledby={DIALOG_TITLE_ID}
      >
        <Dialog.Header caption="Подтверждение" id={DIALOG_TITLE_ID} />
        <Dialog.Body>
          <Text>Вы уверены, что хотите выполнить это действие?</Text>
        </Dialog.Body>
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
