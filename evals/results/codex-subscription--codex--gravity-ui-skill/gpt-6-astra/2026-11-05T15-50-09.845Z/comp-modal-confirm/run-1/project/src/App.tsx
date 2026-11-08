import {useId, useState} from 'react';
import {Button, Dialog, Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  const closeDialog = () => setOpen(false);

  const confirm = () => {
    setConfirmed(true);
    closeDialog();
  };

  return (
    <main className="confirmation-page">
      <section className="confirmation-card" aria-labelledby="page-title">
        <Text as="h1" variant="header-2" id="page-title" className="confirmation-title">
          Подтверждение действия
        </Text>
        <Text as="p" variant="body-2" color="secondary" className="confirmation-description">
          Нажмите на кнопку, чтобы открыть окно подтверждения.
        </Text>
        <Button
          view="action"
          size="l"
          aria-haspopup="dialog"
          onClick={() => {
            setConfirmed(false);
            setOpen(true);
          }}
        >
          Открыть окно
        </Button>
        <div role="status" className="confirmation-status">
          {confirmed && <Text color="positive">Действие подтверждено.</Text>}
        </div>
      </section>

      <Dialog
        open={open}
        onClose={closeDialog}
        size="s"
        initialFocus="cancel"
        hasCloseButton={false}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <Dialog.Header caption="Подтвердить действие?" id={titleId} />
        <Dialog.Body>
          <Text as="p" variant="body-2" id={descriptionId} className="confirmation-dialog-text">
            Вы уверены, что хотите продолжить? Нажмите «Подтвердить», чтобы выполнить действие,
            или «Отменить», чтобы вернуться назад.
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={confirm}
          onClickButtonCancel={closeDialog}
        />
      </Dialog>
    </main>
  );
}
