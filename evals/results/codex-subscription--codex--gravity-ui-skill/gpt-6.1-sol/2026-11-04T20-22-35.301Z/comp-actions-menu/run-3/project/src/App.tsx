import {useEffect, useRef, useState} from 'react';
import {Button, DropdownMenu, Icon, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {ArrowDownToLine, Check, ChevronDown, ChevronRight, CircleCheck, Copy, FileText, Folder, Layers, Lock, Pencil, Plus, TrashBin, Xmark} from '@gravity-ui/icons';
import './App.css';

type Document = {id: string; title: string; modified: string};
const initialDocument: Document = {id: 'project-overview', title: 'Обзор проекта', modified: 'Сегодня, 12:40'};
const storageKey = 'folio-documents';

function loadDocuments(): Document[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (Array.isArray(stored) && stored.every((item) => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.modified === 'string')) {
      return stored;
    }
  } catch {
    // A disabled or unavailable browser store should not prevent using the menu.
  }
  return [initialDocument];
}

export function App() {
  const [documents, setDocuments] = useState<Document[]>(loadDocuments);
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? '');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<'rename' | 'delete' | null>(null);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const current = documents.find((document) => document.id === selectedId);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(documents));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [documents]);

  function notify(message: string) {
    clearTimeout(timer.current);
    setNotice(message);
    timer.current = setTimeout(() => setNotice(''), 4500);
  }

  function duplicate() {
    if (!current) return;
    const copy = {id: crypto.randomUUID(), title: `${current.title} — копия`, modified: 'Только что'};
    setDocuments((items) => [...items, copy]);
    notify('Копия документа создана');
  }

  function download() {
    if (!current) return;
    const content = `${current.title}\n\nХорошие идеи начинаются здесь.\n\nВсё важное о проекте — в одном месте.\n\n01 / Идея и цели\n02 / План работы\n03 / Следующие шаги\n`;
    const url = URL.createObjectURL(new Blob([content], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${current.title}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Документ скачан');
  }

  function remove() {
    const remaining = documents.filter((document) => document.id !== selectedId);
    setDocuments(remaining);
    setSelectedId(remaining[0]?.id ?? '');
    setDialog(null);
    notify('Документ удалён');
  }

  function create() {
    const document = {id: crypto.randomUUID(), title: 'Новый документ', modified: 'Только что'};
    setDocuments((items) => [...items, document]);
    setSelectedId(document.id);
    notify('Документ создан');
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><span className="brand-symbol"><Icon data={Layers} size={21} /></span><Text variant="subheader-3">folio<span className="brand-dot">.</span></Text></div>
        <div className="workspace"><Icon data={Lock} size={14} /><Text variant="body-1">Личное пространство</Text><span className="avatar">АК</span></div>
      </header>

      <main className="main">
        <div className="breadcrumb"><Icon data={Folder} size={15} /><span>Рабочее пространство</span><Icon data={ChevronRight} size={12} /><span className="breadcrumb-current">Документы</span></div>

        <div className="page-heading">
          <div><Text as="h1" variant="display-1">Мои документы</Text><Text as="p" variant="body-2" color="secondary">Всё важное в одном месте. И под вашим контролем.</Text></div>
          <span className="document-count">{documents.length} {documents.length === 1 ? 'документ' : documents.length > 1 && documents.length < 5 ? 'документа' : 'документов'}</span>
        </div>

        {current ? (
          <section className="document-card" aria-label={current.title}>
            <div className="card-heading">
              <span className="file-icon"><Icon data={FileText} size={25} /></span>
              <div className="document-heading"><Text as="h2" variant="subheader-3">{current.title}</Text><div className="document-subtitle"><span>Текстовый документ</span><span className="separator-dot">·</span><span>Личное</span></div></div>
              <DropdownMenu
                open={menuOpen}
                onOpenToggle={setMenuOpen}
                size="l"
                popupProps={{placement: 'bottom-end', offset: 8}}
                menuProps={{className: 'actions-menu', 'aria-label': 'Действия с документом'}}
                renderSwitcher={(props) => <Button {...props} className="actions-button" size="l" view="normal" aria-haspopup="menu" aria-expanded={menuOpen}><span className="action-label">Действия</span><span className={`action-chevron ${menuOpen ? 'action-chevron-open' : ''}`}><Icon data={ChevronDown} size={14} /></span></Button>}
                items={[
                  [
                    {text: 'Переименовать', iconStart: <Icon data={Pencil} size={16} />, action: () => {setDraft(current.title); setDialog('rename');}},
                    {text: 'Создать копию', iconStart: <Icon data={Copy} size={16} />, action: duplicate},
                    {text: 'Скачать', iconStart: <Icon data={ArrowDownToLine} size={16} />, action: download},
                  ],
                  [{text: 'Удалить', iconStart: <Icon data={TrashBin} size={16} />, theme: 'danger', action: () => setDialog('delete')}],
                ]}
              />
            </div>

            <div className="card-content">
              <div className="preview-area" aria-label="Предпросмотр документа">
                <div className="paper">
                  <div className="paper-top"><span className="paper-category">ПРОЕКТ / 2026</span><Icon data={Layers} size={18} /></div>
                  <div className="paper-art" aria-hidden="true"><div className="art-circle" /><div className="art-arch" /><div className="art-square" /><div className="art-small-circle" /></div>
                  <Text as="h3" variant="header-2" className="paper-title">Хорошие идеи<br />начинаются здесь.</Text>
                  <Text as="p" variant="body-1" color="secondary">Всё важное о проекте —<br />в одном месте.</Text>
                  <div className="paper-lines" aria-hidden="true"><span /><span /><span /></div>
                  <div className="paper-footer"><span>{current.title}</span><span>01</span></div>
                </div>
                <span className="preview-label"><Icon data={FileText} size={12} />Предпросмотр документа</span>
              </div>

              <div className="document-details">
                <Text variant="caption-2" className="eyebrow">О ДОКУМЕНТЕ</Text>
                <Text as="h3" variant="header-1">От идеи к результату</Text>
                <Text as="p" variant="body-2" color="secondary">Планы, мысли и следующие шаги.<br className="desktop-break" /> Документ, с которого всё начинается.</Text>
                <dl className="metadata">
                  <div><dt>Создан</dt><dd>4 ноября 2026</dd></div>
                  <div><dt>Изменён</dt><dd>{current.modified}</dd></div>
                  <div><dt>Владелец</dt><dd><span className="small-avatar">АК</span>Вы</dd></div>
                  <div><dt>Доступ</dt><dd><Icon data={Lock} size={13} />Только у вас</dd></div>
                </dl>
                <div className="file-format"><span>TXT</span><Text variant="body-1" color="secondary">Текстовый документ</Text></div>
              </div>
            </div>

            <div className="card-footer"><span className="saved-status"><Icon data={CircleCheck} size={15} /><span>{storageAvailable ? 'Сохранено на этом устройстве' : 'Изменения хранятся до перезагрузки'}</span></span><span className="private-note"><Icon data={Lock} size={12} />Видно только вам</span></div>
          </section>
        ) : (
          <section className="empty-state"><span className="empty-icon"><Icon data={FileText} size={32} /></span><Text as="h2" variant="header-1">Место для новых идей</Text><Text as="p" variant="body-2" color="secondary">Создайте документ, чтобы начать работу.</Text><Button size="l" view="normal" onClick={create}><Icon data={Plus} size={16} />Создать документ</Button></section>
        )}

        {documents.length > 1 && <div className="other-documents"><Text variant="caption-2" color="secondary">ДОКУМЕНТЫ В ПРОСТРАНСТВЕ</Text><div className="document-list">{documents.map((document) => <Button key={document.id} view="outlined" size="l" selected={document.id === selectedId} onClick={() => {setSelectedId(document.id); setMenuOpen(false);}}><Icon data={FileText} size={15} /><span className="document-list-title">{document.title}</span>{document.id === selectedId && <Icon data={Check} size={14} />}</Button>)}</div></div>}

        {current && <div className="hint"><span className="hint-icon"><Icon data={Layers} size={16} /></span><div><Text as="p" variant="body-1">Один документ. Все нужные действия.</Text><Text as="p" variant="body-1" color="secondary">Нажмите «Действия», чтобы переименовать, скопировать или скачать документ.</Text></div></div>}

        <footer className="page-footer"><span>Меньше суеты. Больше пространства для идей.</span><span>Сделано с заботой о деталях<span className="footer-star">✳</span></span></footer>
      </main>

      <Modal open={dialog !== null} onOpenChange={(open) => {if (!open) setDialog(null);}} aria-labelledby="dialog-title" contentClassName="dialog">
        {dialog === 'rename' ? <form onSubmit={(event) => {event.preventDefault(); if (!draft.trim()) return; setDocuments((items) => items.map((document) => document.id === selectedId ? {...document, title: draft.trim(), modified: 'Только что'} : document)); setDialog(null); notify('Название документа изменено');}}>
          <Text as="h2" id="dialog-title" variant="header-1">Переименовать документ</Text><Text as="p" variant="body-2" color="secondary">Выберите понятное название для ваших идей.</Text><label className="input-label" htmlFor="document-name">Название</label><TextInput id="document-name" value={draft} onUpdate={setDraft} autoFocus size="l" controlProps={{maxLength: 100}} /><div className="dialog-actions"><Button size="l" onClick={() => setDialog(null)}>Отмена</Button><Button size="l" view="action" type="submit" disabled={!draft.trim()}>Сохранить</Button></div>
        </form> : dialog === 'delete' ? <div><span className="delete-icon"><Icon data={TrashBin} size={24} /></span><Text as="h2" id="dialog-title" variant="header-1">Удалить документ?</Text><Text as="p" variant="body-2" color="secondary">«{current?.title}» будет удалён. Это действие нельзя отменить.</Text><div className="dialog-actions"><Button size="l" onClick={() => setDialog(null)}>Отмена</Button><Button size="l" view="outlined-danger" onClick={remove}>Удалить</Button></div></div> : null}
      </Modal>

      {notice && <div className="notification" role="status"><span className="notification-icon"><Icon data={CircleCheck} size={19} /></span><Text variant="body-2">{notice}</Text><Button view="flat" size="s" aria-label="Закрыть уведомление" onClick={() => setNotice('')}><Icon data={Xmark} size={15} /></Button></div>}
    </div>
  );
}
