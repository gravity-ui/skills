import {useState} from 'react';
import {Button, DropdownMenu} from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  return (
    <main className="page">
      <section className="actions-card" aria-labelledby="actions-title">
        <span className="eyebrow">МЕНЮ ДЕЙСТВИЙ</span>
        <h1 id="actions-title">Всё под рукой</h1>
        <p className="description">Нажмите на кнопку и выберите нужное действие.</p>
        <DropdownMenu
          open={open}
          onOpenToggle={setOpen}
          size="l"
          popupProps={{placement: 'bottom-start'}}
          menuProps={{'aria-label': 'Список действий'}}
          renderSwitcher={(props) => (
            <Button {...props} view="action" size="l" aria-haspopup="menu" aria-expanded={open}>
              Действия
              <Button.Icon side="end">
                <svg className={open ? 'chevron chevron-open' : 'chevron'} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button.Icon>
            </Button>
          )}
          items={['Редактировать', 'Дублировать', 'Архивировать'].map((text) => ({
            text,
            action: () => setSelectedAction(text),
          }))}
        />
        <div className="action-status" role="status" aria-live="polite">
          {selectedAction ? `Выбрано действие: «${selectedAction}»` : 'Три действия — одна кнопка'}
        </div>
      </section>
    </main>
  );
}
