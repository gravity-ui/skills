import { useState } from 'react';
import { Button, Flex, Text } from '@gravity-ui/uikit';
import { ConfirmDialog } from '@gravity-ui/components';

type Result = 'confirmed' | 'cancelled' | null;

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const handleConfirm = () => {
    setResult('confirmed');
    setOpen(false);
  };

  const handleCancel = () => {
    setResult('cancelled');
    setOpen(false);
  };

  return (
    <Flex direction="column" alignItems="flex-start" gap={3} style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно
      </Button>

      {result && (
        <Text color="secondary">
          {result === 'confirmed' ? 'Действие подтверждено' : 'Действие отменено'}
        </Text>
      )}

      <ConfirmDialog
        open={open}
        size="s"
        title="Подтвердите действие"
        message="Вы уверены, что хотите продолжить? Это действие нельзя будет отменить."
        textButtonApply="Подтвердить"
        textButtonCancel="Отменить"
        onClickButtonApply={handleConfirm}
        onClickButtonCancel={handleCancel}
        onClose={handleCancel}
      />
    </Flex>
  );
}
