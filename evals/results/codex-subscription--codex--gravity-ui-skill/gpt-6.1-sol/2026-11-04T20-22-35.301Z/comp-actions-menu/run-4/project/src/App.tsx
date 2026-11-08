import {useRef, useState} from 'react';
import {Button, DropdownMenu, Text, TextInput} from '@gravity-ui/uikit';
import './App.css';

type DocumentItem = {id: number; name: string; archived: boolean};

export function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>([{id: 1, name: 'План проекта', archived: false}]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState(false);
  const nextId = useRef(2);
  const inputRef = useRef<HTMLInputElement>(null);

  function notify(message: string, isError = false) {
    setNotice(message);
    setError(isError);
  }

  function rename(document: DocumentItem) {
    setDraft(document.name);
    setEditingId(document.id);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function saveName() {
    if (!draft.trim()) return;
    setDocuments((items) => items.map((item) => item.id === editingId ? {...item, name: draft.trim()} : item));
    setEditingId(null);
    notify('Название документа обновлено');
  }

  function duplicate(document: DocumentItem) {
    const copy = {id: nextId.current++, name: `${document.name} — копия`, archived: false};
    setDocuments((items) => [...items, copy]);
    notify('Копия документа создана');
  }

  async function copyLink(document: DocumentItem) {
    const url = new URL(window.location.href);
    url.hash = `document-${document.id}`;
    try {
      await navigator.clipboard.writeText(url.toString());
      notify('Ссылка на документ скопирована');
    } catch {
      notify('Не удалось скопировать ссылку. Проверьте доступ к буферу обмена.', true);
    }
  }

  function download(document: DocumentItem) {
    const content = `${document.name}\n\n1. Цели проекта\nОпределить задачи и ожидаемый результат.\n\n2. Этапы работы\nИсследование, проектирование и реализация.\n\n3. Следующие шаги\nСогласовать план с командой.`;
    const url = URL.createObjectURL(new Blob([content], {type: 'text/plain;charset=utf-8'}));
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.name}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Документ подготовлен к скачиванию');
  }

  function toggleArchive(document: DocumentItem) {
    setDocuments((items) => items.map((item) => item.id === document.id ? {...item, archived: !item.archived} : item));
    notify(document.archived ? 'Документ восстановлен из архива' : 'Документ перемещён в архив');
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="wordmark"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><Text variant="subheader-3">gravity ui</Text><span className="header-divider" /><Text variant="body-2" color="secondary">Песочница</Text></div>
        <span className="header-caption"><span className="tiny-dot" />Маленькие детали. Удобный интерфейс.</span>
      </header>
      <main className="main">
        <section className="intro">
          <span className="eyebrow"><span className="eyebrow-line" />КНОПКА С МЕНЮ</span>
          <Text as="h1" variant="display-3" className="headline">Все действия.<br /><span>В одной кнопке.</span></Text>
          <Text as="p" variant="body-3" color="secondary" className="intro-description">Простой способ держать нужные действия под рукой.<br className="desktop-break" /> Нажмите на кнопку и выберите, что сделать с документом.</Text>
        </section>
        <section className="demo" aria-label="Пример кнопки со списком действий">
          <div className="demo-heading"><span className="demo-label">ПОПРОБУЙТЕ В ДЕЛЕ</span><span className="live-label"><span className="tiny-dot" />Интерактивный пример</span></div>
          <div className="demo-stage">
            <div className="document-list">
              {documents.map((document) => (
                <article className={`document-card${document.archived ? ' document-card_archived' : ''}`} id={`document-${document.id}`} key={document.id}>
                  <div className="document-main">
                    <div className="document-art" aria-hidden="true"><div className="paper"><span /><span /><span /><span /></div></div>
                    <div className="document-info">
                      {editingId === document.id ? (
                        <form className="rename-form" onSubmit={(event) => {event.preventDefault(); saveName();}}>
                          <TextInput controlRef={inputRef} value={draft} onUpdate={setDraft} size="m" controlProps={{'aria-label': 'Название документа'}} onKeyDown={(event) => {if (event.key === 'Escape') setEditingId(null);}} />
                          <div className="rename-buttons"><Button type="submit" view="action" size="s" disabled={!draft.trim()}>Сохранить</Button><Button size="s" onClick={() => setEditingId(null)}>Отмена</Button></div>
                        </form>
                      ) : <Text as="h2" variant="subheader-2" className="document-name">{document.name}</Text>}
                      <Text variant="body-1" color="secondary">Документ<span className="metadata-dot">·</span>3 раздела</Text>
                    </div>
                    <DropdownMenu
                      size="l"
                      open={openId === document.id}
                      onOpenToggle={(open: boolean) => setOpenId(open ? document.id : null)}
                      popupProps={{placement: 'bottom-end', offset: 8, 'aria-label': `Действия с документом «${document.name}»`}}
                      menuProps={{className: 'actions-menu'}}
                      renderSwitcher={({onClick, onKeyDown}) => (
                        <Button view="action" size="l" onClick={onClick} onKeyDown={onKeyDown} aria-haspopup="menu" aria-expanded={openId === document.id} className="actions-button">Действия<span className={`chevron${openId === document.id ? ' chevron_open' : ''}`} aria-hidden="true" /></Button>
                      )}
                      items={[
                        [
                          {text: 'Переименовать', action: () => rename(document)},
                          {text: 'Создать копию', action: () => duplicate(document)},
                          {text: 'Скопировать ссылку', action: () => {void copyLink(document);}},
                          {text: 'Скачать документ', action: () => download(document)},
                        ],
                        [{text: document.archived ? 'Восстановить из архива' : 'Переместить в архив', action: () => toggleArchive(document)}],
                      ]}
                    />
                  </div>
                  <div className="document-footer"><span className="document-status"><span className="tiny-dot" />{document.archived ? 'В архиве' : 'Готов к работе'}</span><Text variant="caption-2" color="secondary">Изменён сегодня</Text></div>
                </article>
              ))}
            </div>
            <div className={`feedback${notice ? ' feedback_active' : ''}${error ? ' feedback_error' : ''}`} role="status" aria-live="polite"><span className="feedback-symbol" aria-hidden="true">{notice ? (error ? '!' : '✓') : '↗'}</span><Text variant="body-1">{notice || 'Начните с кнопки «Действия»'}</Text></div>
          </div>
          <div className="demo-footer"><span><span className="footer-check">✓</span>Пять полезных действий</span><span className="keyboard-hint"><kbd>esc</kbd> чтобы закрыть меню</span></div>
        </section>
        <section className="steps" aria-label="Как пользоваться">
          <div className="step"><span className="step-number">01</span><div><Text as="h3" variant="subheader-1">Откройте меню</Text><Text as="p" variant="body-1" color="secondary">Всё начинается с одного нажатия.</Text></div></div>
          <div className="step"><span className="step-number">02</span><div><Text as="h3" variant="subheader-1">Выберите действие</Text><Text as="p" variant="body-1" color="secondary">Нужные команды в одном месте.</Text></div></div>
          <div className="step"><span className="step-number">03</span><div><Text as="h3" variant="subheader-1">Готово, продолжайте</Text><Text as="p" variant="body-1" color="secondary">Меню закроется после выбора.</Text></div></div>
        </section>
      </main>
      <footer className="page-footer"><Text variant="caption-2" color="secondary">Собрано с вниманием к деталям</Text><span>GRAVITY UI <span className="footer-slash">/</span> ACTIONS MENU</span></footer>
    </div>
  );
}
