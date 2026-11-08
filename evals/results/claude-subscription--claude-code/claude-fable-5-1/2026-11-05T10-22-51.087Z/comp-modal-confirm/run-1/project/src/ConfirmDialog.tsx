import { Dialog, Text } from '@gravity-ui/uikit';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmText = 'Подтвердить',
  cancelText = 'Отменить',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      onEnterKeyDown={onConfirm}
      size="s"
      aria-labelledby="confirm-dialog-title"
      qa="confirm-dialog"
    >
      <Dialog.Header caption={title} id="confirm-dialog-title" />
      <Dialog.Body>
        <Text variant="body-1">{text}</Text>
      </Dialog.Body>
      <Dialog.Footer
        textButtonApply={confirmText}
        textButtonCancel={cancelText}
        onClickButtonApply={onConfirm}
        onClickButtonCancel={onCancel}
        propsButtonApply={{ qa: 'confirm-dialog-apply' }}
        propsButtonCancel={{ qa: 'confirm-dialog-cancel' }}
      />
    </Dialog>
  );
}
