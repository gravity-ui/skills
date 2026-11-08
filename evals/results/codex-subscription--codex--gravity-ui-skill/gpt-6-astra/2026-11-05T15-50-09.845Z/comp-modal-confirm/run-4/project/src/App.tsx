import {useId, useState} from 'react';
import {Button, Dialog, Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState('');
  const titleId = useId();
  const descriptionId = useId();

  const cancel = () => {
    setOpen(false);
    setResult('Действие отменено.');
  };

  const confirm = () => {
    setOpen(false);
    setResult('Действие подтверждено.');
  };

  return (
    <main className="confirmation-page">
      <section className="confirmation-card" aria-labelledby="page-title">
        <Text as="h1" variant="header-2" id="page-title">
          Подтверждение действия
        </Text>
        <Text as="p" variant="body-2" color="secondary">
          Откройте окно, чтобы подтвердить или отменить действие.
        </Text>
        <Button
          view="action"
          size="l"
          onClick={() => {
            setResult('');
            setOpen(true);
          }}
        >
          Открыть окно
        </Button>
        <Text as="p" variant="body-1" className="confirmation-result" role="status">
          {result}
        </Text>
      </section>

      <Dialog
        open={open}
        onClose={cancel}
        size="s"
        initialFocus="cancel"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <Dialog.Header caption="Подтвердить действие?" id={titleId} />
        <Dialog.Body>
          <Text as="p" variant="body-2" id={descriptionId} className="confirmation-description">
            Вы уверены, что хотите продолжить? Нажмите «Подтвердить», чтобы выполнить
            действие, или «Отменить», чтобы вернуться.
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={confirm}
          onClickButtonCancel={cancel}
        />
      </Dialog>
    </main>
  );
}
