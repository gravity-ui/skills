import {useState} from 'react';
import {Button, DropdownMenu, Text} from '@gravity-ui/uikit';
import './App.css';

type Document = {id: number; name: string};

export function App() {
  const [documents, setDocuments] = useState<Document[]>([{id: 1, name: 'План проекта'}]);
  const [archived, setArchived] = useState<Document[]>([]);
  const [nextId, setNextId] = useState(2);
  const [message, setMessage] = useState('Выберите действие в меню справа от документа.');

  async function copyName(document: Document) {
    try {
      await navigator.clipboard.writeText(document.name);
      setMessage(`Название «${document.name}» скопировано.`);
    } catch {
      setMessage('Не удалось скопировать название. Разрешите доступ к буферу обмена и попробуйте снова.');
    }
  }

  function duplicate(document: Document) {
    setDocuments((current) => [...current, {id: nextId, name: `${document.name} — копия`}]);
    setNextId((id) => id + 1);
    setMessage('Копия документа создана.');
  }

  function download(document: Document) {
    const url = URL.createObjectURL(new Blob([`${document.name}\n\nЦель проекта\nОписание задач и основных этапов работы.\n\nЭтапы\n1. Подготовка\n2. Реализация\n3. Проверка результата\n`], {type: 'text/plain;charset=utf-8'}));
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.name}.txt`;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(`Документ «${document.name}» подготовлен к скачиванию.`);
  }

  function archive(document: Document) {
    setDocuments((current) => current.filter(({id}) => id !== document.id));
    setArchived((current) => [...current, document]);
    setMessage(`Документ «${document.name}» перемещён в архив.`);
  }

  function restore() {
    setDocuments((current) => [...current, ...archived]);
    setArchived([]);
    setMessage('Документы восстановлены из архива.');
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>
          <Text variant="subheader-2">Практика</Text>
          <span className="brand-divider" />
          <Text variant="body-1" color="secondary" className="brand-description">Компоненты интерфейса</Text>
        </div>
        <span className="system-label"><span className="system-dot" />Gravity UI</span>
      </header>

      <main className="main">
        <div className="eyebrow"><span />МЕНЮ ДЕЙСТВИЙ</div>
        <Text as="h1" variant="display-2" className="page-title">Всё нужное — в одном меню</Text>
        <Text as="p" variant="body-2" color="secondary" className="page-description">
          Одно нажатие — и все действия с документом под рукой.
        </Text>

        <section className="demo" aria-labelledby="documents-heading">
          <div className="demo-heading">
            <div className="demo-heading-title">
              <Text as="h2" variant="subheader-2" id="documents-heading">Мои документы</Text>
              <span className="document-count" aria-label={`Документов: ${documents.length}`}>{documents.length}</span>
            </div>
            <Text variant="caption-2" color="secondary" className="demo-location">Личное пространство</Text>
          </div>

          <div className="document-list">
            {documents.map((document) => <DocumentRow key={document.id} document={document} onCopy={copyName} onDuplicate={duplicate} onDownload={download} onArchive={archive} />)}
            {documents.length === 0 && (
              <div className="empty-state">
                <Text variant="subheader-2">Все документы в архиве</Text>
                <Text variant="body-1" color="secondary">Восстановите их, чтобы снова работать с документами.</Text>
                <Button view="outlined" onClick={restore}>Восстановить документы</Button>
              </div>
            )}
          </div>

          <div className="demo-footer">
            <span className="status" role="status"><span className="info-mark" aria-hidden="true">i</span>{message}</span>
            {archived.length > 0 && documents.length > 0 && <Button view="flat" size="s" onClick={restore}>Восстановить</Button>}
          </div>
        </section>

        <div className="explanation">
          <span className="explanation-mark" aria-hidden="true">↳</span>
          <div>
            <Text as="p" variant="body-2" className="explanation-title">Меньше кнопок. Больше порядка.</Text>
            <Text as="p" variant="body-1" color="secondary" className="explanation-copy">Дополнительные действия собраны в компактном списке.<br className="desktop-break" /> Нажмите «Действия», чтобы выбрать нужное.</Text>
          </div>
        </div>

        <div className="keyboard-help" aria-label="Управление с клавиатуры">
          <span><kbd>Tab</kbd> перейти к кнопке</span>
          <span><kbd>Enter</kbd> открыть меню</span>
          <span><kbd>Esc</kbd> закрыть</span>
        </div>
      </main>

      <footer className="page-footer"><span>Маленькие детали. Удобный интерфейс.</span><span>Сделано с Gravity UI</span></footer>
    </div>
  );
}

function DocumentRow({document, onCopy, onDuplicate, onDownload, onArchive}: {
  document: Document;
  onCopy: (document: Document) => void;
  onDuplicate: (document: Document) => void;
  onDownload: (document: Document) => void;
  onArchive: (document: Document) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="document-row">
      <div className="document-tile" aria-hidden="true"><span className="paper"><span /><span /><span /></span></div>
      <div className="document-details">
        <Text as="p" variant="subheader-2" className="document-name">{document.name}</Text>
        <Text as="p" variant="body-1" color="secondary" className="document-meta">Текстовый документ <span>·</span> Только что</Text>
      </div>
      <DropdownMenu
        open={open}
        onOpenToggle={setOpen}
        size="l"
        popupProps={{placement: 'bottom-end', offset: 8}}
        menuProps={{'aria-label': `Действия с документом «${document.name}»`}}
        renderSwitcher={(props) => (
          <Button {...props} view="action" size="l" aria-haspopup="menu" aria-expanded={open} aria-label={`Действия с документом «${document.name}»`}>
            <span className="action-label">Действия<span className={`chevron${open ? ' chevron-open' : ''}`} aria-hidden="true" /></span>
          </Button>
        )}
        items={[
          [{text: 'Копировать название', action: () => onCopy(document)},
            {text: 'Создать копию', action: () => onDuplicate(document)},
            {text: 'Скачать документ', action: () => onDownload(document)}],
          [{text: 'Переместить в архив', action: () => onArchive(document)}],
        ]}
      />
    </div>
  );
}
