import { useState } from 'react';
import { Button, DropdownMenu } from '@gravity-ui/uikit';

import './App.css';

const actions = [
  {
    text: 'Редактировать',
    action: () => 'Редактирование открыто',
  },
  {
    text: 'Создать копию',
    action: () => 'Копия создана',
  },
  {
    text: 'Поделиться',
    action: () => 'Ссылка для общего доступа готова',
  },
  {
    text: 'Удалить',
    theme: 'danger' as const,
    action: () => 'Элемент удалён',
  },
];

export function App() {
  const [message, setMessage] = useState('Выберите действие из списка.');

  return (
    <main className="page">
      <section className="actions-card" aria-labelledby="page-title">
        <div className="actions-card__copy">
          <span className="eyebrow">УПРАВЛЕНИЕ ЭЛЕМЕНТОМ</span>
          <h1 id="page-title">Командный центр</h1>
          <p>Все нужные действия собраны в одном месте.</p>
        </div>

        <DropdownMenu
          items={actions.map(({ text, action, ...item }) => ({
            ...item,
            text,
            action: () => setMessage(action()),
          }))}
          renderSwitcher={({ onClick, onKeyDown }) => (
            <Button
              className="actions-button"
              view="action"
              size="l"
              onClick={onClick}
              onKeyDown={onKeyDown}
              aria-haspopup="menu"
            >
              Действия
              <span className="actions-button__chevron" aria-hidden="true">
                ▾
              </span>
            </Button>
          )}
          menuProps={{ size: 'm' }}
        />

        <div className="action-status" role="status" aria-live="polite">
          <span className="action-status__dot" aria-hidden="true" />
          {message}
        </div>
      </section>
    </main>
  );
}
