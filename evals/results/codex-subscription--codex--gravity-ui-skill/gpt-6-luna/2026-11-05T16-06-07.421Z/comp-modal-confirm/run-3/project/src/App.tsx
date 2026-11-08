import {useState} from 'react';
import {Button, type DialogProps} from '@gravity-ui/uikit';
import {ConfirmDialog} from '@gravity-ui/components';

export function App() {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const closeDialog = () => {
    setDialogOpen(false);
  };
  const handleDialogClose: DialogProps['onClose'] = () => closeDialog();

  return (
    <div style={{padding: 24}}>
      <Button view="action" onClick={() => setDialogOpen(true)}>
        Открыть окно
      </Button>
      <ConfirmDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        title="Подтверждение действия"
        message="Вы уверены, что хотите продолжить?"
        textButtonApply="Подтвердить"
        textButtonCancel="Отменить"
        onClickButtonApply={closeDialog}
        onClickButtonCancel={closeDialog}
      />
    </div>
  );
}
