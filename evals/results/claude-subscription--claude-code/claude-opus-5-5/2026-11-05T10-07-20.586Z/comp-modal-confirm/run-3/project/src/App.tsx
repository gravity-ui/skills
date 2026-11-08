import { useId, useState } from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const captionId = useId();

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
        Открыть модальное окно
      </Button>

      {result && <Text color="secondary">{result}</Text>}

      <Dialog
        open={open}
        onClose={handleCancel}
        size="s"
        aria-labelledby={captionId}
      >
        <Dialog.Header caption="Подтверждение действия" id={captionId} />
        <Dialog.Body>
          <Text>Вы уверены, что хотите выполнить это действие? Его нельзя будет отменить.</Text>
        </Dialog.Body>
        <Dialog.Footer
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
        />
      </Dialog>
    </div>
  );
}
