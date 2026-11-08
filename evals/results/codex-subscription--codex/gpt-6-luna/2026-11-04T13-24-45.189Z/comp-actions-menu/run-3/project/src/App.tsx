import { useEffect, useRef, useState } from 'react';

type Action = {
  label: string;
  icon: string;
  shortcut?: string;
  dividerBefore?: boolean;
  danger?: boolean;
};

const actions: Action[] = [
  { label: 'Открыть', icon: '↗', shortcut: '↵' },
  { label: 'Редактировать', icon: '✎', shortcut: '⌘ E' },
  { label: 'Создать копию', icon: '▢', shortcut: '⌘ D' },
  { label: 'Переместить', icon: '⇄', dividerBefore: true },
  { label: 'В архив', icon: '▤', dividerBefore: true },
  { label: 'Удалить', icon: '⌫', danger: true },
];

export function App() {
  const [open, setOpen] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const chooseAction = (label: string) => {
    setLastAction(label);
    setOpen(false);
  };

  return (
    <main className="page">
      <style>{styles}</style>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="workspace" aria-label="Пример меню действий">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true"><span /></div>
          <span className="brand-name">пространство</span>
          <div className="topbar-right"><span className="online-dot" /> Все изменения сохранены</div>
        </header>

        <div className="content">
          <div className="eyebrow"><span className="eyebrow-line" /> РАБОЧАЯ ОБЛАСТЬ</div>
          <div className="title-row">
            <div>
              <h1>Мои документы</h1>
              <p className="subtitle">Всё важное — под рукой</p>
            </div>
            <div className="action-area" ref={rootRef}>
              <button
                className={`action-trigger${open ? ' is-open' : ''}`}
                type="button"
                ref={triggerRef}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls="actions-menu"
                onClick={() => setOpen((value) => !value)}
              >
                <svg className="trigger-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 5.75h10M5 10h10M5 14.25h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <circle cx="3" cy="5.75" r=".8" fill="currentColor" />
                  <circle cx="3" cy="10" r=".8" fill="currentColor" />
                  <circle cx="3" cy="14.25" r=".8" fill="currentColor" />
                </svg>
                <span>Действия</span>
                <svg className="chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {open && (
                <div className="menu" id="actions-menu" role="menu" aria-label="Действия с документом">
                  <div className="menu-heading">ДЕЙСТВИЯ С ДОКУМЕНТОМ</div>
                  {actions.map((action) => (
                    <div className={action.dividerBefore ? 'menu-group' : undefined} key={action.label}>
                      <button
                        className={`menu-item${action.danger ? ' danger' : ''}`}
                        role="menuitem"
                        type="button"
                        onClick={() => chooseAction(action.label)}
                      >
                        <span className="menu-icon" aria-hidden="true">{action.icon}</span>
                        <span className="menu-label">{action.label}</span>
                        {action.shortcut && <span className="shortcut">{action.shortcut}</span>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rule" />
          <div className="section-label">ПОСЛЕДНИЕ</div>
          <article className="document-card">
            <div className="file-icon"><span className="file-fold" /><span className="file-lines" /></div>
            <div className="file-info">
              <div className="file-title">План проекта</div>
              <div className="file-meta">Обновлён сегодня, 10:42 <span className="meta-dot">·</span> Вы</div>
            </div>
            <div className="file-status"><span /> В работе</div>
            <button className="more-button" aria-label="Дополнительные действия" onClick={() => setOpen((value) => !value)} type="button">···</button>
          </article>
          <article className="document-card secondary-card">
            <div className="file-icon lilac"><span className="file-fold" /><span className="file-lines" /></div>
            <div className="file-info">
              <div className="file-title">Идеи и заметки</div>
              <div className="file-meta">Обновлён вчера, 16:18 <span className="meta-dot">·</span> Вы</div>
            </div>
            <div className="file-status archived"><span /> Черновик</div>
            <button className="more-button" aria-label="Дополнительные действия" onClick={() => setOpen((value) => !value)} type="button">···</button>
          </article>

          <div className={`feedback${lastAction ? ' visible' : ''}`} aria-live="polite">
            {lastAction ? <><span className="checkmark">✓</span> Выбрано: {lastAction}</> : ' '}
          </div>
          <div className="hint"><span className="hint-key">ESC</span> закрыть меню <span className="hint-separator">·</span> нажмите снаружи, чтобы отменить</div>
        </div>
        <div className="bottom-glow" />
      </section>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; }
  .page {
    min-height: 100vh; display: grid; place-items: center; overflow: hidden; position: relative;
    padding: 48px 24px; color: #252838; background: #f6f7fb;
    font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .page::before { content: ''; position: absolute; inset: 0; opacity: .4; pointer-events: none;
    background-image: radial-gradient(#bfc4d4 0.65px, transparent .65px); background-size: 19px 19px;
    mask-image: linear-gradient(transparent, black 28%, black 70%, transparent); }
  .ambient { position: absolute; border-radius: 50%; filter: blur(1px); pointer-events: none; }
  .ambient-one { width: 360px; height: 360px; top: 10%; left: 12%; background: radial-gradient(circle, #e5e6fa 0, #e5e6fa00 70%); }
  .ambient-two { width: 440px; height: 440px; right: 9%; bottom: 2%; background: radial-gradient(circle, #f1e8e6 0, #f1e8e600 70%); }
  .workspace { width: min(100%, 840px); min-height: 570px; position: relative; z-index: 1; background: rgba(255,255,255,.91);
    border: 1px solid #e9eaf0; border-radius: 18px; box-shadow: 0 24px 75px #34395112, 0 2px 8px #34395108; overflow: hidden; }
  .topbar { height: 62px; border-bottom: 1px solid #eff0f4; display: flex; align-items: center; padding: 0 34px; gap: 10px; }
  .brand-mark { width: 20px; height: 20px; border-radius: 6px; background: #4f4bc9; transform: rotate(-8deg); display: grid; place-items: center; }
  .brand-mark span { width: 7px; height: 7px; background: #fff; border-radius: 2px; transform: rotate(8deg); }
  .brand-name { font-size: 13px; letter-spacing: -.2px; font-weight: 650; color: #37384b; }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 7px; color: #9b9eaa; font-size: 11px; }
  .online-dot { width: 6px; height: 6px; border-radius: 50%; background: #6fc59c; box-shadow: 0 0 0 3px #6fc59c18; }
  .content { max-width: 660px; margin: 0 auto; padding: 66px 18px 42px; position: relative; }
  .eyebrow { display: flex; align-items: center; gap: 9px; color: #9b9cab; font-size: 9px; font-weight: 700; letter-spacing: 1.45px; }
  .eyebrow-line { width: 16px; height: 1px; background: #aaa9d9; }
  .title-row { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-top: 13px; }
  h1 { margin: 0; color: #282a3a; font-size: 30px; line-height: 1.2; letter-spacing: -1.1px; font-weight: 650; }
  .subtitle { margin: 7px 0 0; font-size: 13px; color: #9295a3; }
  .action-area { position: relative; flex: 0 0 auto; }
  .action-trigger { height: 42px; display: flex; align-items: center; gap: 10px; padding: 0 14px; border: 1px solid #e2e3ec; border-radius: 9px;
    background: #fff; color: #45465a; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 5px #32354c08; transition: border-color .16s, box-shadow .16s, background .16s; }
  .action-trigger:hover, .action-trigger.is-open { border-color: #b9b7e9; background: #fdfdff; box-shadow: 0 0 0 3px #625ed010; }
  .action-trigger:focus-visible, .menu-item:focus-visible, .more-button:focus-visible { outline: 3px solid #7773dc55; outline-offset: 2px; }
  .trigger-icon { width: 17px; height: 17px; color: #6966c8; }
  .chevron { width: 14px; height: 14px; margin-left: 2px; color: #9a9bab; transition: transform .18s; }
  .is-open .chevron { transform: rotate(180deg); }
  .menu { position: absolute; z-index: 5; top: calc(100% + 9px); right: 0; width: 252px; padding: 8px; border: 1px solid #e9e9f0; border-radius: 12px; background: #fff;
    box-shadow: 0 16px 44px #272a421c, 0 3px 10px #272a420a; animation: menu-in .15s ease-out; transform-origin: top right; }
  @keyframes menu-in { from { opacity: 0; transform: translateY(-4px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .menu-heading { color: #a1a2ae; font-size: 8px; font-weight: 700; letter-spacing: 1.1px; padding: 8px 10px 9px; }
  .menu-item { display: flex; align-items: center; width: 100%; height: 38px; gap: 10px; padding: 0 10px; border: 0; border-radius: 7px; background: transparent; color: #444658; text-align: left; font: inherit; font-size: 12px; cursor: pointer; transition: background .12s, color .12s; }
  .menu-item:hover { background: #f5f5fb; color: #3734a4; }
  .menu-icon { width: 17px; color: #85869a; font-size: 15px; text-align: center; line-height: 1; }
  .menu-item:hover .menu-icon { color: #6966c8; }
  .menu-label { flex: 1; }
  .shortcut { color: #b1b2bd; font-size: 10px; letter-spacing: .2px; }
  .menu-group { border-top: 1px solid #f0f0f4; margin-top: 5px; padding-top: 5px; }
  .menu-item.danger { color: #c65162; }
  .menu-item.danger .menu-icon { color: #d27a85; }
  .menu-item.danger:hover { background: #fff4f5; color: #b53e50; }
  .rule { height: 1px; background: #eff0f4; margin: 34px 0 27px; }
  .section-label { color: #a5a6b2; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; margin: 0 0 12px 2px; }
  .document-card { min-height: 72px; display: flex; align-items: center; border: 1px solid #eeeff4; border-radius: 10px; padding: 0 14px; background: #fff; transition: border-color .15s, box-shadow .15s; }
  .document-card:hover { border-color: #d8d8eb; box-shadow: 0 4px 14px #34395108; }
  .secondary-card { margin-top: 9px; }
  .file-icon { width: 34px; height: 38px; border-radius: 7px; position: relative; background: #f0efff; margin-right: 13px; display: flex; flex-direction: column; justify-content: center; gap: 4px; padding-left: 9px; }
  .file-fold { position: absolute; right: 0; top: 0; width: 10px; height: 10px; border-radius: 0 6px 0 4px; background: #d9d7fa; }
  .file-lines { width: 14px; height: 2px; border-radius: 3px; background: #9995df; box-shadow: 0 5px 0 #b8b5eb, 0 10px 0 #b8b5eb; }
  .file-icon.lilac { background: #f7effa; } .lilac .file-fold { background: #efdcf1; } .lilac .file-lines { background: #cb9cce; box-shadow: 0 5px 0 #dec2e0, 0 10px 0 #dec2e0; }
  .file-title { font-size: 12px; font-weight: 600; color: #454657; }
  .file-meta { margin-top: 5px; color: #a2a3af; font-size: 10px; }
  .meta-dot { padding: 0 4px; color: #cacbd3; }
  .file-status { margin-left: auto; display: flex; align-items: center; gap: 6px; color: #7d9f8e; font-size: 10px; background: #f0f8f3; padding: 6px 9px; border-radius: 20px; }
  .file-status > span { width: 5px; height: 5px; border-radius: 50%; background: #79bb92; }
  .file-status.archived { color: #a18ba5; background: #f8f3f9; } .file-status.archived > span { background: #c39bc8; }
  .more-button { border: 0; background: transparent; color: #a4a5b1; font-size: 20px; letter-spacing: 1px; line-height: 1; margin-left: 13px; width: 25px; height: 30px; border-radius: 6px; cursor: pointer; }
  .more-button:hover { background: #f5f5fb; color: #5d5ac0; }
  .feedback { min-height: 18px; margin-top: 15px; color: #7271b7; text-align: center; font-size: 11px; opacity: 0; transition: opacity .2s; }
  .feedback.visible { opacity: 1; }
  .checkmark { display: inline-grid; place-items: center; width: 14px; height: 14px; border-radius: 50%; background: #efeffb; margin-right: 4px; font-size: 9px; }
  .hint { margin-top: 19px; text-align: center; font-size: 10px; color: #b1b2bd; }
  .hint-key { color: #88899a; padding: 3px 5px; border: 1px solid #e5e5ec; border-radius: 4px; font-size: 8px; font-weight: 650; margin-right: 4px; }
  .hint-separator { padding: 0 7px; color: #d0d0d8; }
  .bottom-glow { position: absolute; bottom: -1px; height: 3px; left: 14%; right: 14%; background: linear-gradient(90deg, #fff0, #918de0, #e5a8b7, #fff0); opacity: .7; filter: blur(2px); }
  @media (max-width: 600px) { .page { padding: 18px 12px; } .workspace { min-height: 540px; } .topbar { padding: 0 20px; } .topbar-right { font-size: 0; } .topbar-right .online-dot { margin-right: 4px; } .content { padding: 52px 20px 34px; } .title-row { align-items: flex-start; flex-direction: column; gap: 18px; } .action-area { align-self: stretch; } .action-trigger { width: 100%; justify-content: center; } .menu { left: 0; right: auto; width: 100%; } h1 { font-size: 27px; } .file-status { display: none; } }
`;
