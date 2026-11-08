import {useId, useState} from 'react';
import {Button, Dialog, Text} from '@gravity-ui/uikit';

export function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  const closeDialog = () => setIsOpen(false);

  return (
    <main style={{padding: 'var(--g-spacing-6)'}}>
      <Button
        view="action"
        size="l"
        aria-haspopup="dialog"
        onClick={() => {
          setIsConfirmed(false);
          setIsOpen(true);
        }}
      >
        Открыть модальное окно
      </Button>

      <Text as="p" variant="body-1" role="status">
        {isConfirmed ? 'Действие подтверждено.' : ''}
      </Text>

      <Dialog
        open={isOpen}
        onClose={closeDialog}
        size="s"
        initialFocus="cancel"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <Dialog.Header caption="Подтвердите действие" id={titleId} />
        <Dialog.Body>
          <Text as="p" variant="body-1" id={descriptionId}>
            Вы уверены, что хотите продолжить? Нажмите «Подтвердить», чтобы
            выполнить действие, или «Отменить», чтобы закрыть окно.
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={() => {
            setIsConfirmed(true);
            closeDialog();
          }}
          onClickButtonCancel={closeDialog}
        />
      </Dialog>
    </main>
  );
}
