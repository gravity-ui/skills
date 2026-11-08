import {useEffect, useRef, useState} from 'react';
import {Archive, ArrowDownToLine, ChevronDown, ChevronRight, CircleCheck, Copy, FileText, Folder, Link} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon, Label, Text} from '@gravity-ui/uikit';
import './App.css';

const content = `Стратегия бренда\n\nОт идеи к узнаваемому бренду\n\nПозиционирование, ценности и визуальное направление. Всё, что помогает нам говорить на одном языке и двигаться вперёд.\n\n1. Кто мы\nСоздаём понятные и полезные продукты.\n\n2. Наш подход\nВнимание к деталям, открытость и простота.\n\n3. Наш голос\nГоворим ясно, по делу и с заботой.`;

export function App() {
  const [open, setOpen] = useState(false);
  const [archived, setArchived] = useState(false);
  const [copies, setCopies] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  function notify(message: string) {
    clearTimeout(timer.current);
    setNotice(message);
    timer.current = setTimeout(() => setNotice(''), 4500);
  }

  async function copyLink() {
    try {
      const url = new URL(window.location.href);
      url.hash = 'brand-strategy';
      await navigator.clipboard.writeText(url.href);
      notify('Ссылка на документ скопирована');
    } catch {
      notify('Не удалось скопировать ссылку. Попробуйте ещё раз.');
    }
  }

  function duplicate() {
    setCopies((current) => [...current, current.length + 1]);
    notify('Копия документа создана');
  }

  function download(copyNumber?: number) {
    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Стратегия бренда${copyNumber ? ` — копия ${copyNumber}` : ''}.txt`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Документ скачан');
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" aria-label="Folio">
          <span className="brand-mark"><span /><span /><span /></span>
          <Text variant="header-2">folio<span className="brand-dot">.</span></Text>
        </div>
        <div className="workspace"><Text variant="body-1" color="secondary">Личное пространство</Text><span className="avatar">АК</span></div>
      </header>

      <main className="main">
        <div className="breadcrumbs"><Icon data={Folder} size={15} /><Text variant="body-1">Моё пространство</Text><Icon data={ChevronRight} size={12} /><Text variant="body-1" color="primary">Документы</Text></div>
        <div className="page-heading">
          <div className="heading-title"><Text as="h1" variant="display-3">Документы</Text><span className="document-count">{1 + copies.length}</span></div>
          <Text as="p" variant="body-2" color="secondary">Ваши идеи, планы и важные детали — в одном месте.</Text>
        </div>
        <div className="section-label"><Text variant="caption-2">ВАШИ ФАЙЛЫ</Text><Text variant="caption-2">{1 + copies.length} {copies.length === 0 ? 'документ' : copies.length < 4 ? 'документа' : 'документов'}</Text></div>

        <article className="document-card" id="brand-strategy">
          <div className="card-header">
            <div className="document-identity">
              <span className="file-icon"><Icon data={FileText} size={23} /></span>
              <div className="document-name"><Text as="h2" variant="subheader-3">Стратегия бренда</Text><Text variant="body-1" color="secondary">Текстовый документ · 1 КБ</Text></div>
            </div>
            <DropdownMenu
              open={open}
              onOpenToggle={setOpen}
              size="l"
              popupProps={{placement: 'bottom-end', offset: 8, className: 'actions-popup'}}
              menuProps={{'aria-label': 'Действия с документом'}}
              renderSwitcher={(props) => (
                <Button {...props} view="action" size="l" className="actions-button" aria-haspopup="menu" aria-expanded={open}>
                  Действия
                  <Button.Icon side="end"><Icon className={open ? 'chevron chevron-open' : 'chevron'} data={ChevronDown} size={15} /></Button.Icon>
                </Button>
              )}
              items={[
                [
                  {text: 'Скопировать ссылку', iconStart: <Icon data={Link} size={17} />, action: copyLink},
                  {text: 'Создать копию', iconStart: <Icon data={Copy} size={17} />, action: duplicate},
                  {text: 'Скачать документ', iconStart: <Icon data={ArrowDownToLine} size={17} />, action: () => download()},
                ],
                [{text: archived ? 'Вернуть из архива' : 'Переместить в архив', iconStart: <Icon data={Archive} size={17} />, action: () => {
                  setArchived(!archived);
                  notify(archived ? 'Документ возвращён из архива' : 'Документ перемещён в архив');
                }}],
              ]}
            />
          </div>
          <div className="document-preview">
            <div className="paper-scene" aria-hidden="true">
              <div className="paper-back" />
              <div className="paper">
                <span className="paper-eyebrow">BRAND STRATEGY</span>
                <Text variant="display-4" className="paper-monogram">Aa<span>.</span></Text>
                <div className="paper-line" /><div className="paper-line paper-line-short" />
                <span className="paper-page">01 — 06</span>
              </div>
            </div>
            <div className="preview-copy">
              <Label theme={archived ? 'warning' : 'success'} size="xs">{archived ? 'В архиве' : 'В работе'}</Label>
              <Text as="h3" variant="header-1">От идеи к узнаваемому бренду</Text>
              <Text as="p" variant="body-2" color="secondary">Позиционирование, ценности и визуальное направление. Всё, что помогает нам говорить на одном языке и двигаться вперёд.</Text>
              <div className="tags"><span>Маркетинг</span><span>Планирование</span></div>
            </div>
          </div>
          <div className="card-footer">
            <div className="author"><span className="avatar avatar-small">АК</span><Text variant="body-1" color="secondary">Вы <span className="footer-dot">·</span> Владелец</Text></div>
            <Text variant="body-1" color="secondary">Изменён сегодня, 10:42</Text>
          </div>
        </article>

        {copies.map((number) => (
          <article className="copy-card" key={number}>
            <span className="file-icon"><Icon data={FileText} size={21} /></span>
            <div className="copy-name"><Text variant="subheader-2">Стратегия бренда — копия {number}</Text><Text variant="body-1" color="secondary">Создана только что</Text></div>
            <Button view="outlined" size="m" onClick={() => download(number)} aria-label={`Скачать копию ${number}`}><Icon data={ArrowDownToLine} size={17} /></Button>
          </article>
        ))}
        <div className="help-note"><Icon data={ChevronDown} size={14} /><Text variant="body-1" color="secondary">Всё нужное — в меню «Действия». Просто нажмите на кнопку.</Text></div>
        <div className="save-status"><Icon data={CircleCheck} size={15} /><Text variant="caption-2">Все изменения сохранены</Text></div>
      </main>
      <footer className="page-footer"><Text variant="caption-2" color="hint">Немного порядка. Больше пространства для идей.</Text><Text variant="caption-2" color="hint">FOLIO WORKSPACE</Text></footer>
      <div className={`notification${notice ? ' notification-visible' : ''}`} role="status" aria-live="polite">{notice && <><Icon data={CircleCheck} size={19} /><Text variant="body-2">{notice}</Text></>}</div>
    </div>
  );
}
