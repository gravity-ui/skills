import { useState } from 'react';
import { Button, DropdownMenu } from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [selectedAction, setSelectedAction] = useState('');

  const items = [
    [
      { text: 'Новый документ', action: () => setSelectedAction('Новый документ') },
      { text: 'Новая папка', action: () => setSelectedAction('Новая папка') },
      { text: 'Создать доску', action: () => setSelectedAction('Создать доску') },
    ],
    [
      { text: 'Загрузить файл', action: () => setSelectedAction('Загрузить файл') },
      { text: 'Загрузить папку', action: () => setSelectedAction('Загрузить папку') },
    ],
  ];

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Главная">
          <span className="brand-mark">n</span>
          <span>пространство</span>
        </a>
        <div className="user-avatar" aria-label="Профиль пользователя">А</div>
      </header>

      <section className="workspace" aria-labelledby="page-title">
        <div className="eyebrow">МОЁ ПРОСТРАНСТВО <span>/</span> ФАЙЛЫ</div>
        <div className="heading-row">
          <div>
            <h1 id="page-title">Мои файлы</h1>
            <p className="subtitle">Все важное — в одном месте</p>
          </div>
          <DropdownMenu
            items={items}
            size="l"
            popupProps={{ placement: 'bottom-end', offset: 8 }}
            renderSwitcher={({ onClick, onKeyDown }) => (
              <Button
                view="action"
                size="l"
                className="create-button"
                onClick={onClick}
                onKeyDown={onKeyDown}
                aria-label="Открыть список действий"
              >
                <span className="plus-icon" aria-hidden="true">+</span>
                Создать
                <span className="chevron" aria-hidden="true">⌄</span>
              </Button>
            )}
          />
        </div>

        <div className="content-card">
          <div className="folder-illustration" aria-hidden="true">
            <div className="folder-back" />
            <div className="folder-front"><span>✦</span></div>
            <div className="spark spark-one">✦</div>
            <div className="spark spark-two">·</div>
          </div>
          <h2>Здесь пока пусто</h2>
          <p>Создайте документ или загрузите файлы,<br />чтобы начать работу.</p>
          <div className="empty-hint"><span className="hint-dot" /> Ваши файлы будут доступны только вам</div>
        </div>

        {selectedAction && (
          <div className="selection-note" role="status">
            <span className="note-check">✓</span>
            Выбрано действие: <strong>{selectedAction}</strong>
            <button className="dismiss-button" onClick={() => setSelectedAction('')} aria-label="Скрыть уведомление">×</button>
          </div>
        )}
      </section>
    </main>
  );
}
