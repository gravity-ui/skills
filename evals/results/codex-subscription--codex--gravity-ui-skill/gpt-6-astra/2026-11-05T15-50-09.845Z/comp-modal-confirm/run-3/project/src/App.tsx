import {useId, useState} from 'react';
import {Button, Dialog, Text} from '@gravity-ui/uikit';

export function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  const closeDialog = () => setIsOpen(false);

  const confirm = () => {
    setIsConfirmed(true);
    closeDialog();
  };

  return (
    <main style={{padding: 'var(--g-spacing-6)'}}>
      <Button
        view="action"
        size="l"
        onClick={() => {
          setIsConfirmed(false);
          setIsOpen(true);
        }}
      >
        Открыть модальное окно
      </Button>

      <div role="status" style={{marginTop: 'var(--g-spacing-4)'}}>
        {isConfirmed && <Text variant="body-1">Действие подтверждено.</Text>}
      </div>

      <Dialog
        open={isOpen}
        onClose={closeDialog}
        size="s"
        initialFocus="cancel"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <Dialog.Header caption="Подтверждение действия" id={titleId} />
        <Dialog.Body>
          <Text as="p" variant="body-1" id={descriptionId}>
            Вы уверены, что хотите выполнить это действие? Нажмите «Подтвердить»,
            чтобы продолжить, или «Отменить», чтобы закрыть окно.
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
