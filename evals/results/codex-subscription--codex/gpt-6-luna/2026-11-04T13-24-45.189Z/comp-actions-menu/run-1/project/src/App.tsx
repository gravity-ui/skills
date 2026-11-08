import { useState } from 'react';
import { Button, DropdownMenu } from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [message, setMessage] = useState('');
  const actions = [
    [
      { text: 'Переименовать', action: () => setMessage('Переименование') },
      { text: 'Создать копию', action: () => setMessage('Копирование') },
      { text: 'Переместить', action: () => setMessage('Перемещение') },
    ],
    [
      { text: 'Архивировать', action: () => setMessage('Архивация') },
      { text: 'Удалить', theme: 'danger' as const, action: () => setMessage('Удаление') },
    ],
  ];

  return (
    <main className="page">
      <section className="action-card" aria-labelledby="page-title">
        <div className="card-topline">
          <span className="eyebrow">УПРАВЛЕНИЕ ФАЙЛОМ</span>
          <span className="file-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6.75 3.75h7l4.5 4.5v12h-11.5v-16.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M13.5 3.9v4.6h4.6M9.5 13h6M9.5 16.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <h1 id="page-title">Отчёт по проекту</h1>
        <p className="description">Выберите действие для этого документа.</p>

        <div className="action-row">
          <DropdownMenu
            items={actions}
            renderSwitcher={({ onClick, onKeyDown }) => (
              <Button view="action" size="l" onClick={onClick} onKeyDown={onKeyDown} aria-label="Открыть список действий">
                Действия
                <Button.Icon side="end">
                  <svg className="chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button.Icon>
              </Button>
            )}
            onSwitcherClick={() => setMessage('')}
          />
          <span className="hint">5 доступных действий</span>
        </div>

        {message && (
          <div className="feedback" role="status">
            <span className="feedback-dot" />
            Выбрано действие: <strong>{message}</strong>
          </div>
        )}

        <div className="card-footer">
          <span className="status-dot" />
          <span>Все изменения сохранены</span>
          <span className="updated">Обновлено только что</span>
        </div>
      </section>
      <p className="page-note">Рабочее пространство <span>·</span> Мои документы</p>
    </main>
  );
}
