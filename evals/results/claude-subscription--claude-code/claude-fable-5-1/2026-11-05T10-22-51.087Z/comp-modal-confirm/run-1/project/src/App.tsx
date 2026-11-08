import { useState } from 'react';
import { Button, Flex, Text } from '@gravity-ui/uikit';

import { ConfirmDialog } from './ConfirmDialog';

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
    <Flex direction="column" gap={3} alignItems="flex-start" style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)} qa="open-dialog">
        Открыть окно
      </Button>

      {result && (
        <Text variant="body-1" color="secondary" qa="result">
          {result === 'confirmed' ? 'Действие подтверждено' : 'Действие отменено'}
        </Text>
      )}

      <ConfirmDialog
        open={open}
        title="Подтверждение действия"
        text="Вы уверены, что хотите выполнить это действие? Отменить его будет нельзя."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Flex>
  );
}
