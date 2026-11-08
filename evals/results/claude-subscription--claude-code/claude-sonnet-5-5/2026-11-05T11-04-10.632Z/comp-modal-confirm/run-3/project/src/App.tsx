import React from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState<'confirmed' | 'cancelled' | null>(null);
  const titleId = React.useId();

  const handleConfirm = () => {
    setResult('confirmed');
    setOpen(false);
  };

  const handleCancel = () => {
    setResult('cancelled');
    setOpen(false);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result && (
        <Text color="secondary">
          {result === 'confirmed' ? 'Действие подтверждено' : 'Действие отменено'}
        </Text>
      )}

      <Dialog
        open={open}
        onClose={handleCancel}
        size="s"
        aria-labelledby={titleId}
      >
        <Dialog.Header caption="Подтверждение действия" id={titleId} />
        <Dialog.Body>Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.</Dialog.Body>
        <Dialog.Footer
          onClickButtonCancel={handleCancel}
          onClickButtonApply={handleConfirm}
          textButtonCancel="Отмена"
          textButtonApply="Подтвердить"
        />
      </Dialog>
    </div>
  );
}
