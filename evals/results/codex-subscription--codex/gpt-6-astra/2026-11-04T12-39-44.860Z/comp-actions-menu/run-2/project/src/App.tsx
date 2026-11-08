import { useState } from 'react';
import { Button, DropdownMenu } from '@gravity-ui/uikit';
import './App.css';

function ActionIcon({ type }: { type: 'edit' | 'copy' | 'download' | 'archive' }) {
  const paths = {
    edit: <><path d="m11 3 4 4M3 13l1-4 8-8 4 4-8 8-5 1Z" /></>,
    copy: <><rect x="6" y="6" width="9" height="9" rx="2" /><path d="M10 6V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h3" /></>,
    download: <><path d="M8 1v9m-4-4 4 4 4-4M2 11v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" /></>,
    archive: <><rect x="1" y="2" width="14" height="4" rx="1" /><path d="M2 6v8h12V6M6 9h4" /></>,
  };
  return <svg width="16" height="16" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

export function App() {
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  const actions = [
    { text: 'Редактировать', type: 'edit' },
    { text: 'Дублировать', type: 'copy' },
    { text: 'Скачать', type: 'download' },
    { text: 'Архивировать', type: 'archive' },
  ] as const;

  return (
    <main className="page">
      <section className="action-card" aria-labelledby="card-title">
        <div className="card-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="3" />
            <path d="M9 8h6M9 12h6M9 16h3" />
          </svg>
        </div>
        <span className="eyebrow">ВСЁ ПОД РУКОЙ</span>
        <h1 id="card-title">Что будем делать?</h1>
        <p className="description">Нужные действия — в одном меню.<br />Нажмите на кнопку и выберите подходящее.</p>
        <DropdownMenu
          open={open}
          onOpenToggle={setOpen}
          size="l"
          popupProps={{ placement: 'bottom-start' }}
          menuProps={{ 'aria-label': 'Действия', className: 'actions-menu' }}
          renderSwitcher={(props) => (
            <Button {...props} view="action" size="xl" className="action-button" aria-haspopup="menu" aria-expanded={open}>
              <span className="button-content">Действия
                <svg className={open ? 'chevron is-open' : 'chevron'} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
              </span>
            </Button>
          )}
          items={actions.map(({ text, type }) => ({
            text,
            iconStart: <ActionIcon type={type} />,
            action: () => setSelectedAction(text),
          }))}
        />
        <div className="card-footer" role="status" aria-live="polite">
          {selectedAction ? <><span className="status-dot" />Выбрано: «{selectedAction}»</> : <><span className="hint-dot" />Одно нажатие. Несколько возможностей.</>}
        </div>
      </section>
      <p className="page-note">Меньше поиска. Больше дела.</p>
    </main>
  );
}
