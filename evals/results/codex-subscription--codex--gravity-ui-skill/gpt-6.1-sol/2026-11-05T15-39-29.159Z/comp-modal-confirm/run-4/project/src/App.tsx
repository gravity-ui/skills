import {useRef, useState} from 'react';
import {Button, Card, Dialog, Text} from '@gravity-ui/uikit';
import './App.css';

function DialogArtwork({small = false}: {small?: boolean}) {
  return (
    <div className={`dialog-artwork${small ? ' dialog-artwork_small' : ''}`} aria-hidden="true">
      <div className="artwork-back" />
      <div className="artwork-window">
        <div className="artwork-dots"><i /><i /><i /></div>
        <div className="artwork-line" />
        <div className="artwork-line artwork-line_short" />
        <div className="artwork-actions"><i /><i /></div>
      </div>
    </div>
  );
}

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function confirm() {
    setConfirmed(true);
    setOpen(false);
  }

  return (
    <div className="app">
      <header className="page-header">
        <div className="wordmark"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><Text variant="header-1">точка</Text></div>
        <Text variant="body-1" className="header-note">Простые действия. Продуманные решения.</Text>
      </header>

      <main className="main">
        <div className="intro">
          <div className="eyebrow"><span className="status-dot" /><Text variant="body-1">Всё под вашим контролем</Text></div>
          <Text as="h1" variant="display-3" className="page-title">Важные действия —<br />с вашего согласия.</Text>
          <Text as="p" variant="body-3" className="page-description">Один клик, чтобы продолжить.<br />И ещё один — чтобы быть уверенным.</Text>
        </div>

        <Card view="outlined" className="action-card">
          <div className="card-body">
            <div className="card-top"><DialogArtwork /><Text variant="caption-2" className="card-index">01 / ПОДТВЕРЖДЕНИЕ</Text></div>
            <Text as="h2" variant="header-2" className="card-title">Сначала уточним</Text>
            <Text as="p" variant="body-2" className="card-description">Откройте диалог, чтобы подтвердить действие.<br className="desktop-break" /> Вы всегда можете передумать и отменить его.</Text>
          </div>
          <div className="card-footer">
            <div className="card-action-caption"><Text variant="body-1">Ваше решение имеет значение</Text></div>
            <Button ref={triggerRef} view="action" size="xl" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>Открыть диалог <span className="button-arrow" aria-hidden="true">↗</span></Button>
          </div>
        </Card>

        <div className={`feedback${confirmed ? ' feedback_success' : ''}`} role="status" aria-live="polite">
          <span className={confirmed ? 'confirmation-check' : 'reassurance-dot'} aria-hidden="true">{confirmed ? '✓' : '·'}</span>
          <Text variant="body-1">{confirmed ? 'Готово! Действие подтверждено.' : 'Ничего не произойдёт без вашего подтверждения'}</Text>
        </div>

        <div className="interaction-note"><span className="note-rule" /><Text variant="caption-2">ПРОСТО. ПОНЯТНО. ОСОЗНАННО.</Text><span className="note-rule" /></div>
      </main>

      <footer className="page-footer"><Text variant="body-1">Немного внимания перед следующим шагом.</Text><Text variant="body-1" className="system-credit"><span className="credit-dot" />Сделано с Gravity UI</Text></footer>

      <Dialog open={open} onClose={() => setOpen(false)} size="s" initialFocus="cancel" returnFocus={triggerRef} aria-labelledby="confirmation-title" aria-describedby="confirmation-description" className="confirmation-dialog">
        <div className="dialog-visual"><DialogArtwork small /></div>
        <Dialog.Header id="confirmation-title" caption="Подтвердить действие?" />
        <Dialog.Body><Text as="p" variant="body-2" id="confirmation-description" className="dialog-description">Вы собираетесь выполнить действие. Нажмите «Подтвердить», чтобы продолжить, или «Отменить», чтобы вернуться без изменений.</Text></Dialog.Body>
        <Dialog.Footer textButtonCancel="Отменить" textButtonApply="Подтвердить" onClickButtonCancel={() => setOpen(false)} onClickButtonApply={confirm} propsButtonCancel={{view: 'outlined'}} />
      </Dialog>
    </div>
  );
}
