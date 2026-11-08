import { useState } from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

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
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result && <Text>{result}</Text>}

      <Dialog open={open} onClose={handleCancel} size="s">
        <Dialog.Header caption="Подтверждение" />
        <Dialog.Body>
          <Text>Вы уверены, что хотите выполнить это действие? Отменить его будет нельзя.</Text>
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
