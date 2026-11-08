import {useState} from 'react';
import {Button, DropdownMenu, Text} from '@gravity-ui/uikit';
import './App.css';

type Document = {id: number; title: string; archived: boolean};

export function App() {
  const [documents, setDocuments] = useState<Document[]>([
    {id: 1, title: 'План проекта', archived: false},
  ]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  async function copyTitle(title: string) {
    try {
      await navigator.clipboard.writeText(title);
      setMessage('Название скопировано');
    } catch {
      setMessage('Не удалось скопировать название. Проверьте доступ к буферу обмена.');
    }
  }

  function download(title: string) {
    const url = URL.createObjectURL(new Blob([`${title}\n\nЦели проекта\n\nЗадачи\n\nСледующие шаги\n`], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Документ подготовлен к скачиванию');
  }

  return (
    <main className="page">
      <section className="workspace" aria-labelledby="page-title">
        <div className="section-label"><span className="section-dot" />ВАШИ ДОКУМЕНТЫ</div>
        <Text as="h1" variant="header-2" id="page-title" className="page-title">Всё под рукой</Text>
        <Text as="p" variant="body-2" color="secondary" className="description">
          Откройте меню, чтобы выбрать действие с документом.
        </Text>

        <div className="documents">
          {documents.map((item) => (
            <div className="document-row" key={item.id}>
              <div className="document-symbol" aria-hidden="true"><span>TXT</span></div>
              <div className="document-info">
                <Text as="div" variant="subheader-2" className="document-title">{item.title}</Text>
                <Text as="div" variant="body-1" color="secondary">{item.archived ? 'В архиве' : 'Текстовый документ'}</Text>
              </div>
              {item.archived ? (
                <Button view="outlined" size="l" onClick={() => {
                  setDocuments((current) => current.map((entry) => entry.id === item.id ? {...entry, archived: false} : entry));
                  setMessage('Документ восстановлен');
                }}>Восстановить</Button>
              ) : (
                <DropdownMenu
                  size="l"
                  open={openId === item.id}
                  onOpenToggle={(open: boolean) => setOpenId(open ? item.id : null)}
                  popupProps={{placement: 'bottom-end', 'aria-label': `Действия с документом «${item.title}»`}}
                  renderSwitcher={(props) => (
                    <Button {...props} view="action" size="l" aria-haspopup="menu" aria-expanded={openId === item.id}>
                      Действия <span className={`chevron ${openId === item.id ? 'chevron-open' : ''}`} aria-hidden="true" />
                    </Button>
                  )}
                  items={[
                    {text: 'Копировать название', action: () => {void copyTitle(item.title);}},
                    {text: 'Скачать документ', action: () => download(item.title)},
                    {text: 'Создать копию', action: () => {
                      setDocuments((current) => [...current, {id: Math.max(...current.map((entry) => entry.id)) + 1, title: `${item.title} — копия`, archived: false}]);
                      setMessage('Копия документа создана');
                    }},
                    [{text: 'В архив', action: () => {
                      setDocuments((current) => current.map((entry) => entry.id === item.id ? {...entry, archived: true} : entry));
                      setMessage('Документ перемещён в архив. Его можно восстановить.');
                    }}],
                  ]}
                />
              )}
            </div>
          ))}
        </div>

        <div className="status" role="status" aria-live="polite">
          <Text variant="body-1" color="secondary">{message || 'Выберите действие — остальное в один клик.'}</Text>
        </div>
        <div className="workspace-footer">
          <Text variant="caption-2" color="secondary">Простые действия. Больше порядка.</Text>
          <span className="footer-dots" aria-hidden="true">•••</span>
        </div>
      </section>
    </main>
  );
}
