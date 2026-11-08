import {useState} from 'react';
import {Button, Dialog, Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const openDialog = () => {
    setConfirmed(false);
    setOpen(true);
  };

  const confirm = () => {
    setConfirmed(true);
    setOpen(false);
  };

  return (
    <div className="workspace">
      <header className="workspace-header">
        <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
        <Text variant="subheader-2">Простые действия</Text>
        <span className="header-divider" aria-hidden="true" />
        <Text variant="body-1" color="secondary">Рабочее пространство</Text>
      </header>

      <main className="workspace-main">
        <div className="confirmation-section">
          <Text as="p" variant="caption-2" color="secondary" className="eyebrow">
            ВСЁ ПОД ВАШИМ КОНТРОЛЕМ
          </Text>
          <section className="confirmation-card" aria-labelledby="card-title">
            <div className="dialog-illustration" aria-hidden="true">
              <div className="mini-window">
                <div className="mini-window-top"><span /><span /><span /></div>
                <div className="mini-line mini-line-title" />
                <div className="mini-line" />
                <div className="mini-line mini-line-short" />
                <div className="mini-actions"><span /><span /></div>
              </div>
              <span className="illustration-check">✓</span>
            </div>

            <Text as="h1" variant="header-2" id="card-title" className="card-title">
              Подтверждение действия
            </Text>
            <Text as="p" variant="body-2" color="secondary" className="card-description">
              Важные решения — за вами. Откройте окно,
              чтобы подтвердить действие или отменить его.
            </Text>
            <Button view="action" size="xl" onClick={openDialog}>
              Открыть модальное окно
            </Button>

            <div className="result-message" role="status" aria-live="polite">
              {confirmed ? (
                <Text variant="body-1" color="positive">✓ Действие успешно подтверждено</Text>
              ) : (
                <Text variant="body-1" color="hint">Действие выполнится только после подтверждения</Text>
              )}
            </div>

            <div className="card-footer">
              <span className="info-symbol" aria-hidden="true">i</span>
              <Text variant="body-1" color="secondary">Вы всегда можете передумать и нажать «Отменить».</Text>
            </div>
          </section>
          <Text as="p" variant="caption-2" color="hint" className="keyboard-hint">
            <kbd>Esc</kbd> — закрыть окно без подтверждения
          </Text>
        </div>
      </main>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="s"
        initialFocus="cancel"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
      >
        <Dialog.Header caption="Подтвердить действие?" id="confirmation-title" />
        <Dialog.Body>
          <Text as="p" variant="body-2" id="confirmation-description" className="dialog-description">
            Вы собираетесь выполнить действие. Нажмите «Подтвердить», чтобы продолжить,
            или «Отменить», чтобы вернуться без изменений.
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={confirm}
          onClickButtonCancel={() => setOpen(false)}
        />
      </Dialog>
    </div>
  );
}
