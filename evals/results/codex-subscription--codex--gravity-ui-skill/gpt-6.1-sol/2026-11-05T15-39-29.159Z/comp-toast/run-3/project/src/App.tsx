import {useRef, useState} from 'react';
import {
  Button,
  SegmentedRadioGroup,
  Text,
  TextInput,
  Toast,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';
import type {ToastTheme} from '@gravity-ui/uikit';
import './App.css';

const variants = [
  {value: 'success', label: 'Успех', title: 'Всё получилось!', description: 'Изменения успешно сохранены.'},
  {value: 'info', label: 'Информация', title: 'Есть новости', description: 'Все обновления уже доступны.'},
  {value: 'danger', label: 'Ошибка', title: 'Что-то пошло не так', description: 'Попробуйте повторить действие.'},
] as const;

function Playground() {
  const toaster = useToaster();
  const sequence = useRef(0);
  const [theme, setTheme] = useState<ToastTheme>('success');
  const [title, setTitle] = useState<string>(variants[0].title);
  const [description, setDescription] = useState<string>(variants[0].description);
  const [duration, setDuration] = useState('5');
  const [count, setCount] = useState(0);

  function reset() {
    setTheme('success');
    setTitle(variants[0].title);
    setDescription(variants[0].description);
    setDuration('5');
    toaster.removeAll();
  }

  function showNotification() {
    toaster.removeAll();
    toaster.add({
      name: `notification-${++sequence.current}`,
      title: title.trim() || 'Новое уведомление',
      content: description.trim() || undefined,
      theme,
      autoHiding: Number(duration) * 1000,
      isClosable: true,
    });
    setCount((value) => value + 1);
  }

  return (
    <div className="app">
      <header className="header">
        <a className="wordmark" href="./" aria-label="Тихо — главная">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          тихо<span className="wordmark-dot">.</span>
        </a>
        <div className="header-caption"><span className="header-divider" />Маленькие детали. Большая разница.</div>
        <span className="header-tag"><span className="status-dot" />Интерактивная песочница</span>
      </header>

      <main className="main">
        <div className="eyebrow"><span>ИНТЕРФЕЙС В ДЕТАЛЯХ</span><span className="eyebrow-line" />01 / УВЕДОМЛЕНИЯ</div>
        <div className="intro">
          <div>
            <Text as="h1" variant="display-3" className="page-title">Нужные слова.<br /><span>В нужный момент.</span></Text>
            <Text as="p" variant="body-3" className="intro-copy">Сообщите о важном и позвольте продолжить работу.<br className="desktop-break" /> Уведомление появится в углу экрана и исчезнет само.</Text>
          </div>
          <div className="intro-note"><span className="note-spark" aria-hidden="true">✳</span><span>Немного внимания.<br />Никаких отвлечений.</span></div>
        </div>

        <section className="playground" aria-label="Настройка уведомления">
          <div className="settings">
            <div className="panel-heading"><Text as="h2" variant="subheader-3">Ваше уведомление</Text><Button view="flat-secondary" size="s" onClick={reset}>Сбросить <span aria-hidden="true">↺</span></Button></div>
            <div className="field">
              <Text as="p" variant="body-2" className="field-label">Тип уведомления</Text>
              <div className="type-options" role="group" aria-label="Тип уведомления">
                {variants.map((item) => (
                  <Button key={item.value} className={`type-option type-${item.value} ${theme === item.value ? 'is-selected' : ''}`} view="outlined" size="l" selected={theme === item.value} aria-pressed={theme === item.value} onClick={() => {
                    setTheme(item.value);
                    setTitle(item.title);
                    setDescription(item.description);
                  }}><span className={`type-dot dot-${item.value}`} />{item.label}</Button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="notification-title">Заголовок</label>
              <TextInput id="notification-title" size="l" value={title} onUpdate={setTitle} placeholder="Новое уведомление" controlProps={{maxLength: 80}} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="notification-description">Сообщение</label>
              <TextInput id="notification-description" size="l" value={description} onUpdate={setDescription} placeholder="Добавьте подробности" controlProps={{maxLength: 180}} />
            </div>
            <div className="field duration-field">
              <div className="label-row"><Text variant="body-2">Время показа</Text><span className="tiny-clock" aria-hidden="true" /></div>
              <SegmentedRadioGroup size="l" width="max" value={duration} onUpdate={setDuration} aria-label="Время показа" options={[{value: '3', content: '3 секунды'}, {value: '5', content: '5 секунд'}, {value: '8', content: '8 секунд'}]} />
              <Text as="p" variant="caption-2" color="secondary" className="field-hint">Исчезнет автоматически. Без лишних кликов.</Text>
            </div>
          </div>

          <div className="preview-panel">
            <div className="preview-topline"><span>ПРЕДПРОСМОТР</span><span className="live-tag"><span />В реальном времени</span></div>
            <div className="browser-preview">
              <div className="browser-toolbar"><div className="window-dots"><i /><i /><i /></div><div className="browser-address"><span aria-hidden="true">⌑</span> your-workspace.app</div><span className="browser-menu">···</span></div>
              <div className="browser-content" aria-hidden="true">
                <div className="mock-sidebar"><div className="mock-logo" /><div /><div /><div /><div /></div>
                <div className="mock-page"><div className="mock-line heading-line" /><div className="mock-line subtitle-line" /><div className="mock-cards"><div /><div /><div /></div><div className="mock-line long-line" /><div className="mock-line medium-line" /><div className="mock-line long-line" /><div className="mock-line short-line" /></div>
              </div>
              <div className="sample-toast">
                <Toast name="preview" title={title.trim() || 'Новое уведомление'} content={description.trim() || undefined} theme={theme} autoHiding={false} isClosable={false} removeCallback={() => {}} />
              </div>
            </div>
            <div className="preview-caption"><span className="preview-pointer" aria-hidden="true">↳</span><Text variant="body-1" color="secondary">Вот так это будет выглядеть</Text></div>
            <div className="preview-bottom"><span className="small-check" aria-hidden="true">✓</span>Достаточно заметно. Достаточно ненавязчиво.</div>
          </div>
        </section>

        <div className="features">
          <div className="feature"><span className="feature-number">01</span><div><Text as="h3" variant="subheader-1">Появляется по клику</Text><Text as="p" variant="body-1" color="secondary">Только тогда, когда вы захотите.</Text></div></div>
          <div className="feature"><span className="feature-number">02</span><div><Text as="h3" variant="subheader-1">Исчезает само</Text><Text as="p" variant="body-1" color="secondary">Через выбранное вами время.</Text></div></div>
          <div className="feature"><span className="feature-number">03</span><div><Text as="h3" variant="subheader-1">Остаётся в стороне</Text><Text as="p" variant="body-1" color="secondary">Не прерывает вашу работу.</Text></div></div>
        </div>
        <footer className="footer"><span>Меньше шума. Больше смысла.</span><span>Сделано с <span className="gravity-name">Gravity UI <span aria-hidden="true">↗</span></span></span></footer>
      </main>

      <div className="launch-area">
        <span className="launch-hint">Попробуйте — нажмите на кнопку <span aria-hidden="true">↘</span></span>
        <Button className="launch-button" view="action" size="xl" onClick={showNotification}><span className="launch-plus" aria-hidden="true">＋</span>Показать уведомление<span className="launch-arrow" aria-hidden="true">↗</span></Button>
        <span className="sr-only" role="status">{count > 0 ? `Уведомлений показано: ${count}` : ''}</span>
      </div>
      <ToasterComponent className="notification-stack" />
    </div>
  );
}

export function App() {
  const [toaster] = useState(() => new Toaster());
  return <ToasterProvider toaster={toaster}><Playground /></ToasterProvider>;
}
