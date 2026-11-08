import {useState} from 'react';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import {ChevronDown, Copy, FileText, Pencil, ArrowDownToLine, TrashBin, Check} from '@gravity-ui/icons';
import './App.css';

export function App() {
  const [open, setOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  const selectAction = (action: string) => {
    setSelectedAction(action);
    setOpen(false);
  };

  return (
    <div className="app">
      <header className="page-header">
        <a className="brand" href="./" aria-label="На главную">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          ui essentials<span className="brand-dot">.</span>
        </a>
        <span className="header-caption">Маленькие детали. Удобный интерфейс.</span>
      </header>

      <main className="main">
        <div className="eyebrow"><span /> ЭЛЕМЕНТЫ ИНТЕРФЕЙСА</div>
        <h1>Все действия.<br /><span>В одной кнопке.</span></h1>
        <p className="intro">Нужные команды всегда рядом.<br />Нажмите на кнопку, чтобы выбрать действие.</p>

        <section className="demo" aria-label="Пример меню действий">
          <div className="demo-topline"><span>ПОПРОБУЙТЕ САМИ</span><span className="demo-dots"><i /><i /><i /></span></div>
          <div className="document-card">
            <div className="document-details">
              <div className="file-icon"><Icon data={FileText} size={25} /></div>
              <div><h2>План проекта</h2><p>Документ <span>·</span> Обновлён сегодня</p></div>
            </div>
            <DropdownMenu
              open={open}
              onOpenToggle={setOpen}
              size="l"
              popupProps={{placement: 'bottom-end', className: 'actions-popup', offset: 8}}
              menuProps={{'aria-label': 'Действия с документом'}}
              renderSwitcher={(props) => (
                <Button {...props} view="action" size="l" className="actions-button" aria-haspopup="menu" aria-expanded={open}>
                  Действия
                  <span className={`chevron ${open ? 'chevron-open' : ''}`}><Icon data={ChevronDown} size={14} /></span>
                </Button>
              )}
              items={[
                [
                  {text: 'Редактировать', iconStart: <Icon data={Pencil} size={16} />, action: () => selectAction('Редактировать')},
                  {text: 'Дублировать', iconStart: <Icon data={Copy} size={16} />, action: () => selectAction('Дублировать')},
                  {text: 'Скачать', iconStart: <Icon data={ArrowDownToLine} size={16} />, action: () => selectAction('Скачать')},
                ],
                [{text: 'Удалить', theme: 'danger', iconStart: <Icon data={TrashBin} size={16} />, action: () => selectAction('Удалить')}],
              ]}
            />
          </div>
          <div className="demo-feedback" role="status" aria-live="polite">
            {selectedAction ? <><span className="success-icon"><Icon data={Check} size={14} /></span>Выбрано действие «{selectedAction}»</> : <><span className="hint-dot" />Четыре действия — одно аккуратное меню</>}
          </div>
        </section>

        <div className="keyboard-hint"><kbd>Esc</kbd><span>закрыть меню</span><span className="hint-divider" /><kbd>↑</kbd><kbd>↓</kbd><span>выбрать пункт</span></div>
      </main>
      <footer><span>Меньше шума. Больше порядка.</span><span>Сделано с Gravity UI <span className="footer-spark">✳</span></span></footer>
    </div>
  );
}
