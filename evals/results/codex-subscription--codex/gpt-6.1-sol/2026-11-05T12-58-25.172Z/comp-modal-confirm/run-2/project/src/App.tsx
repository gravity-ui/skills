import {useEffect, useState} from 'react';
import {Button, Dialog} from '@gravity-ui/uikit';
import './App.css';

function DecisionIcon({small = false}: {small?: boolean}) {
  return (
    <svg width={small ? 22 : 32} height={small ? 22 : 32} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="22" height="24" rx="6" stroke="currentColor" strokeWidth="1.7" />
      <path d="m11 16 3.5 3.5L21 13" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (!showNotice) return;
    const timer = window.setTimeout(() => setShowNotice(false), 5000);
    return () => window.clearTimeout(timer);
  }, [showNotice]);

  function confirm() {
    setOpen(false);
    setConfirmed(true);
    setShowNotice(true);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Точка — главная">
          <span className="brand-symbol" aria-hidden="true"><span /><span /><span /><span /></span>
          точка<span className="brand-period">.</span>
        </a>
        <span className="header-caption">Маленькие действия. Важные решения.</span>
        <span className="header-label"><span /> Всё под контролем</span>
      </header>

      <main className="main-content">
        <div className="intro">
          <span className="eyebrow"><span /> ПРОСТРАНСТВО РЕШЕНИЙ</span>
          <h1>Сначала —<br />ваше решение<span className="title-period">.</span></h1>
          <p>Иногда нужен ещё один момент,<br className="desktop-break" /> чтобы убедиться, что всё правильно.</p>
        </div>

        <section className="action-card" aria-labelledby="card-title">
          <div className="card-topline"><span>ОДИН ШАГ ДО ДЕЙСТВИЯ</span><span className="card-number">01 / 01</span></div>
          <div className="card-content">
            <div className="decision-illustration" aria-hidden="true">
              <span className="illustration-orbit orbit-one" />
              <span className="illustration-orbit orbit-two" />
              <span className="illustration-dot" />
              <div className="icon-tile"><DecisionIcon /></div>
              <span className="little-plus">+</span>
            </div>
            <h2 id="card-title">Подтверждение действия</h2>
            <p>Откройте окно, чтобы подтвердить<br className="desktop-break" /> действие или передумать.</p>
            <Button className="primary-button open-button" view="action" size="xl" aria-haspopup="dialog" aria-expanded={open} onClick={() => {setShowNotice(false); setOpen(true);}}>
              Открыть модальное окно <ArrowIcon />
            </Button>
          </div>
          <div className={`card-status${confirmed ? ' is-confirmed' : ''}`} role="status">
            {confirmed ? <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="5" y="9" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.4" /></svg>}
            {confirmed ? 'Действие успешно подтверждено' : 'Ничего не произойдёт без вашего подтверждения'}
          </div>
        </section>

        <div className="below-card"><span className="hint-line" /><span>Ваш выбор — за вами</span><span className="hint-line" /></div>
      </main>

      <footer className="site-footer"><span>Всё начинается с осознанного клика.</span><span className="footer-right">ПРОСТО И ПО ДЕЛУ <span>↗</span></span></footer>

      <Dialog open={open} onClose={() => setOpen(false)} className="confirmation-dialog" modalClassName="confirmation-overlay" aria-labelledby="dialog-title" aria-describedby="dialog-description" initialFocus="cancel" size="s">
        <div className="dialog-heading-icon"><DecisionIcon small /></div>
        <Dialog.Header caption="Подтвердить действие?" as="h2" id="dialog-title" />
        <Dialog.Body><p id="dialog-description" className="dialog-description">Вы собираетесь выполнить действие. Нажмите «Подтвердить», чтобы продолжить, или «Отменить», чтобы вернуться назад.</p></Dialog.Body>
        <Dialog.Footer textButtonCancel="Отменить" textButtonApply="Подтвердить" onClickButtonCancel={() => setOpen(false)} onClickButtonApply={confirm} propsButtonApply={{className: 'primary-button'}} />
        <div className="dialog-keyboard-hint"><kbd>Esc</kbd> чтобы закрыть окно</div>
      </Dialog>

      {showNotice && <div className="success-notice" role="status"><span className="notice-check">✓</span><span>Действие подтверждено</span><button type="button" onClick={() => setShowNotice(false)} aria-label="Закрыть уведомление">×</button></div>}
    </div>
  );
}
