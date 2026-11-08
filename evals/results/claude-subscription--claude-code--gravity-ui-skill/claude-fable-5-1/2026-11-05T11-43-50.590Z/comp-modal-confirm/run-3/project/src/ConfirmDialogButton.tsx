import React from 'react';
import { Button, Dialog, Text } from '@gravity-ui/uikit';

export interface ConfirmDialogButtonProps {
  /** Текст на кнопке, открывающей модальное окно */
  buttonText?: string;
  /** Заголовок модального окна */
  title?: string;
  /** Текст внутри модального окна */
  message?: string;
  /** Подпись кнопки подтверждения */
  confirmText?: string;
  /** Подпись кнопки отмены */
  cancelText?: string;
  /** Вызывается при подтверждении */
  onConfirm?: () => void;
  /** Вызывается при отмене (кнопка «Отменить», крестик, Esc, клик вне окна) */
  onCancel?: () => void;
}

export function ConfirmDialogButton({
  buttonText = 'Открыть окно',
  title = 'Подтверждение действия',
  message = 'Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.',
  confirmText = 'Подтвердить',
  cancelText = 'Отменить',
  onConfirm,
  onCancel,
}: ConfirmDialogButtonProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm?.();
  };

  const handleCancel = () => {
    setOpen(false);
    onCancel?.();
  };

  return (
    <>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        {buttonText}
      </Button>

      <Dialog
        open={open}
        onClose={handleCancel}
        size="s"
        initialFocus="cancel"
        aria-labelledby="confirm-dialog-title"
      >
        <Dialog.Header caption={title} id="confirm-dialog-title" />
        <Dialog.Body>
          <Text variant="body-1">{message}</Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply={confirmText}
          textButtonCancel={cancelText}
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
        />
      </Dialog>
    </>
  );
}
