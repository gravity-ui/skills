import React from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

export interface ConfirmModalProps {
  /** Текст кнопки, открывающей модальное окно */
  triggerText?: string;
  /** Заголовок модального окна */
  title?: string;
  /** Текст внутри модального окна */
  message: string;
  textButtonApply?: string;
  textButtonCancel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmModal({
  triggerText = 'Открыть',
  title = 'Подтверждение действия',
  message,
  textButtonApply = 'Подтвердить',
  textButtonCancel = 'Отменить',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [open, setOpen] = React.useState(false);
  const titleId = React.useId();

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        {triggerText}
      </Button>

      <Dialog
        open={open}
        onClose={handleCancel}
        onEnterKeyDown={handleConfirm}
        size="s"
        aria-labelledby={titleId}
      >
        <Dialog.Header caption={title} id={titleId} />
        <Dialog.Body>
          <Text variant="body-2" as="p">
            {message}
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply={textButtonApply}
          textButtonCancel={textButtonCancel}
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
        />
      </Dialog>
    </React.Fragment>
  );
}
