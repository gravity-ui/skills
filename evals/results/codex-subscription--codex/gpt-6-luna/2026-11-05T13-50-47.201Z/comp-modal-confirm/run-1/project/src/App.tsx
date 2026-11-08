import { useState } from 'react';
import { Button, Dialog } from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const closeDialog = () => setDialogOpen(false);

  return (
    <main className="page">
      <section className="prompt-card" aria-labelledby="page-title">
        <span className="eyebrow">ПОДТВЕРЖДЕНИЕ</span>
        <h1 id="page-title">Перед тем как продолжить</h1>
        <p className="intro">Откройте диалог, чтобы подтвердить действие.</p>
        <Button size="l" view="action" onClick={() => setDialogOpen(true)}>
          Открыть окно
        </Button>
        {confirmed && (
          <p className="result" role="status">Действие подтверждено</p>
        )}
      </section>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        onOpenChange={(open) => setDialogOpen(open)}
        aria-labelledby="confirm-title"
        size="s"
        initialFocus="cancel"
      >
        <Dialog.Header id="confirm-title" caption="Подтвердите действие" />
        <Dialog.Body>
          <p className="dialog-copy">
            Вы уверены, что хотите продолжить? Это действие будет подтверждено.
          </p>
        </Dialog.Body>
        <Dialog.Footer>
            <>
              <Button view="flat" size="m" onClick={closeDialog}>
                Отменить
              </Button>
              <Button
                view="action"
                size="m"
                onClick={() => {
                  setConfirmed(true);
                  closeDialog();
                }}
              >
                Подтвердить
              </Button>
            </>
        </Dialog.Footer>
      </Dialog>
    </main>
  );
}
