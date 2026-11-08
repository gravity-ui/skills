import { useEffect, useRef, useState, type ReactNode } from 'react';
import './App.css';

const actions = [
  { label: 'Редактировать', icon: 'edit' },
  { label: 'Создать копию', icon: 'copy' },
  { label: 'Поделиться', icon: 'share' },
  { label: 'Переместить в архив', icon: 'archive' },
  { label: 'Удалить', icon: 'delete', destructive: true },
];

function ActionIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    edit: <><path d="m14 5 5 5" /><path d="M4 20h4l11-11a2.1 2.1 0 0 0-4-4L4 16v4Z" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.4" /></>,
    archive: <><path d="M3 4h18v4H3z" /><path d="M5 8v12h14V8m-9 4h4" /></>,
    delete: <><path d="M3 6h18m-2 0-1 14H6L5 6m4 0V4h6v2m-5 4v6m4-6v6" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function App() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const chooseAction = (label: string) => {
    setSelected(label);
    setOpen(false);
  };

  return (
    <main className="page">
      <section className="action-card" aria-label="Действия с документом">
        <div className="card-heading">
          <div className="file-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h8l5 5v13H6z" /><path d="M14 3v6h5M9 13h7m-7 4h7" /></svg>
          </div>
          <div>
            <p className="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО</p>
            <h1>Мой документ</h1>
          </div>
        </div>
        <div className="card-divider" />
        <div className="card-footer">
          <span className="updated"><span className="status-dot" />Все изменения сохранены</span>
          <div className="menu-wrap" ref={menuRef}>
            <button
              className={`action-trigger${open ? ' is-open' : ''}`}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <svg className="trigger-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v.01M12 12v.01M12 19v.01" strokeWidth="3" /></svg>
              Действия
              <svg className="chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
            </button>
            {open && (
              <div className="action-menu" role="menu" aria-label="Действия с документом">
                {actions.map((action, index) => (
                  <button
                    key={action.label}
                    className={`menu-item${action.destructive ? ' destructive' : ''}${index === 3 ? ' separated' : ''}`}
                    type="button"
                    role="menuitem"
                    onClick={() => chooseAction(action.label)}
                  >
                    <ActionIcon name={action.icon} />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {selected && <div className="selection-note" role="status">Выбрано действие: <strong>{selected}</strong></div>}
      </section>
      <p className="page-caption">Управляйте документом с помощью меню действий</p>
    </main>
  );
}
