import { useState } from 'react';
import { Button } from '@gravity-ui/uikit';
import { ConfirmDialog } from '@gravity-ui/components';

export function App() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть окно подтверждения
      </Button>

      <ConfirmDialog
        open={open}
        onClose={close}
        title="Подтверждение действия"
        message="Вы уверены, что хотите продолжить? Это действие нельзя будет отменить."
        textButtonApply="Подтвердить"
        textButtonCancel="Отмена"
        onClickButtonApply={close}
        onClickButtonCancel={close}
      />
    </div>
  );
}
