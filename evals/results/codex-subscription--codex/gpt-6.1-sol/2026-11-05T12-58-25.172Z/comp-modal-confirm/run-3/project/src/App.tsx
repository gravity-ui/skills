import {useState} from 'react';
import {Button, Dialog} from '@gravity-ui/uikit';
import './App.css';

function WindowIcon({small = false}: {small?: boolean}) {
  return (
    <svg width={small ? 21 : 28} height={small ? 21 : 28} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="20" height="18" rx="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 11h20" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8" cy="8" r=".85" fill="currentColor" />
      <circle cx="11" cy="8" r=".85" fill="currentColor" />
      {!small && <path d="m11 17 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 12 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<'confirmed' | 'cancelled' | null>(null);

  function finish(value: 'confirmed' | 'cancelled') {
    setOpen(false);
    setResult(value);
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand"><span className="brand-mark"><WindowIcon small /></span><span>ясно<span className="brand-dot">.</span></span></div>
        <span className="header-caption">Меньше сомнений. Больше ясности.</span>
      </header>

      <main className="main">
        <div className="intro">
          <span className="eyebrow"><span /> ПРОСТЫЕ ВЗАИМОДЕЙСТВИЯ</span>
          <h1>Решение за вами<span>.</span></h1>
          <p>Немного ясности перед следующим шагом.</p>
        </div>

        <section className="action-card" aria-labelledby="card-title">
          <div className="card-content">
            <div className="icon-scene" aria-hidden="true">
              <span className="scene-dot scene-dot-one" /><span className="scene-dot scene-dot-two" />
              <div className="window-shadow" />
              <div className="mini-window">
                <div className="mini-window-bar"><i /><i /><i /><span /></div>
                <div className="mini-window-body"><span className="mini-line" /><span className="mini-line short" /><div className="mini-actions"><span /><span /></div></div>
              </div>
              <div className="scene-check"><CheckIcon /></div>
            </div>
            <span className="card-label">ОДИН КЛИК — И ВСЁ ПОНЯТНО</span>
            <h2 id="card-title">Сначала — подтверждение</h2>
            <p className="card-description">Откройте модальное окно, ознакомьтесь<br className="desktop-break" /> с сообщением и выберите, как поступить.</p>
            <Button
              view="action"
              size="xl"
              width="max"
              className="open-button"
              onClick={() => {setResult(null); setOpen(true);}}
            >
              Открыть модальное окно
              <Button.Icon side="end"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></Button.Icon>
            </Button>
          </div>
          <div className="card-bottom"><span className="tiny-shield"><svg width="15" height="16" viewBox="0 0 20 22" fill="none" aria-hidden="true"><path d="m10 2 7 3v5c0 5-7 9-7 9s-7-4-7-9V5l7-3Z" stroke="currentColor" strokeWidth="1.4" /><path d="m7 10 2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>Ничего не произойдёт без вашего согласия</div>
        </section>

        <div className={`result ${result ? `result-${result}` : ''}`} role="status" aria-live="polite">
          {result === 'confirmed' && <><span className="result-icon"><CheckIcon /></span>Действие успешно подтверждено</>}
          {result === 'cancelled' && <><span className="cancel-dot" />Действие отменено. Можно попробовать снова.</>}
          {!result && <span className="interaction-hint">Попробуйте — выбор всегда можно отменить</span>}
        </div>
      </main>

      <footer className="site-footer"><span>Простота в каждом действии</span><span className="footer-detail"><span />Всё под вашим контролем</span></footer>

      <Dialog
        open={open}
        onClose={() => finish('cancelled')}
        size="s"
        className="confirm-dialog"
        modalClassName="confirm-modal"
        initialFocus="cancel"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="dialog-symbol"><WindowIcon /></div>
        <Dialog.Header caption="Подтвердить действие?" as="h2" id="dialog-title" />
        <Dialog.Body>
          <p id="dialog-description" className="dialog-description">Вы собираетесь выполнить действие. Нажмите «Подтвердить», чтобы продолжить, или «Отменить», чтобы вернуться.</p>
        </Dialog.Body>
        <Dialog.Footer
          textButtonCancel="Отменить"
          textButtonApply="Подтвердить"
          onClickButtonCancel={() => finish('cancelled')}
          onClickButtonApply={() => finish('confirmed')}
          propsButtonCancel={{view: 'outlined', size: 'xl'}}
          propsButtonApply={{view: 'action', size: 'xl'}}
        />
      </Dialog>
    </div>
  );
}
