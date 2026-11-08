import { useState } from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

type Result = 'confirmed' | 'cancelled' | null;

const RESULT_TEXT: Record<Exclude<Result, null>, string> = {
  confirmed: 'Действие подтверждено',
  cancelled: 'Действие отменено',
};

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const finish = (value: Exclude<Result, null>) => {
    setResult(value);
    setOpen(false);
  };

  return (
    <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result && <Text color="secondary">{RESULT_TEXT[result]}</Text>}

      <Dialog
        open={open}
        onClose={() => finish('cancelled')}
        size="s"
        aria-labelledby="confirm-dialog-title"
      >
        <Dialog.Header caption="Подтверждение действия" id="confirm-dialog-title" />
        <Dialog.Body>Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.</Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отмена"
          onClickButtonApply={() => finish('confirmed')}
          onClickButtonCancel={() => finish('cancelled')}
        />
      </Dialog>
    </div>
  );
}
