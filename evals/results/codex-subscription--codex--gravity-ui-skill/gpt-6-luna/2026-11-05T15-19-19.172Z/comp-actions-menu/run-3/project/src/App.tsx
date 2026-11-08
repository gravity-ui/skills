import {useState} from 'react';
import {Button, DropdownMenu} from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [lastAction, setLastAction] = useState('');

  const items = [
    {text: 'Открыть', action: () => setLastAction('Открыт документ')},
    {text: 'Переименовать', action: () => setLastAction('Можно изменить название')},
    {text: 'Создать копию', action: () => setLastAction('Копия создана')},
    {text: 'Удалить', action: () => setLastAction('Элемент удалён')},
  ];

  return (
    <main className="actions-page">
      <section className="actions-card" aria-labelledby="actions-title">
        <div className="actions-card__content">
          <span className="actions-card__eyebrow">УПРАВЛЕНИЕ</span>
          <h1 id="actions-title" className="actions-card__title">Действия с документом</h1>
          <p className="actions-card__description">
            Выберите нужное действие из списка.
          </p>

          <DropdownMenu
            items={items}
            defaultSwitcherProps={{view: 'action', size: 'l'}}
            renderSwitcher={({onClick, onKeyDown}) => (
              <Button
                view="action"
                size="l"
                onClick={onClick}
                onKeyDown={onKeyDown}
                aria-haspopup="menu"
              >
                Действия
                <span className="actions-chevron" aria-hidden="true">⌄</span>
              </Button>
            )}
          />

          {lastAction && (
            <p className="actions-card__feedback" role="status">{lastAction}</p>
          )}
        </div>
        <div className="actions-card__decoration" aria-hidden="true">
          <span>DOC</span>
          <span className="actions-card__decoration-dot" />
        </div>
      </section>
    </main>
  );
}
