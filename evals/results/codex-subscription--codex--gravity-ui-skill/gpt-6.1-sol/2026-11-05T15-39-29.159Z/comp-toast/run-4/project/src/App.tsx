import {useRef, useState} from 'react';
import {Button, SegmentedRadioGroup, Text, Toaster, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';
import './App.css';

const messages = {
  success: {label: 'Успех', symbol: '✓', title: 'Всё получилось!', content: 'Изменения сохранены. Можно двигаться дальше.'},
  info: {label: 'Информация', symbol: 'i', title: 'Вы в курсе', content: 'Здесь появится всё, что вам нужно знать.'},
  warning: {label: 'Внимание', symbol: '!', title: 'Обратите внимание', content: 'Перед продолжением проверьте внесённые изменения.'},
} as const;
type MessageType = keyof typeof messages;

function NotificationPlayground() {
  const [type, setType] = useState<MessageType>('success');
  const [duration, setDuration] = useState('5');
  const [visible, setVisible] = useState(false);
  const sequence = useRef(0);
  const toaster = useToaster();
  const message = messages[type];

  function showNotification() {
    const notificationId = ++sequence.current;
    toaster.removeAll();
    setVisible(true);
    toaster.add({
      name: `notification-${notificationId}`,
      title: message.title,
      content: message.content,
      theme: type,
      autoHiding: Number(duration) * 1000,
      isClosable: true,
      onClose: () => {
        if (sequence.current === notificationId) setVisible(false);
      },
    });
  }

  return (
    <div className="playground">
      <header className="page-header">
        <div className="wordmark"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>тише<span className="wordmark-dot">.</span></div>
        <div className="header-caption"><span className="small-dot" />Простые взаимодействия</div>
      </header>
      <main className="main-content">
        <div className="intro">
          <Text as="p" variant="caption-2" className="eyebrow">МАЛЕНЬКИЕ ДЕТАЛИ, БОЛЬШОЙ КОМФОРТ</Text>
          <Text as="h1" variant="display-2" className="page-title">Важное — на мгновение.</Text>
          <Text as="p" variant="body-3" color="secondary" className="intro-description">Уведомление появляется, когда нужно, и уходит само.<br className="desktop-break" /> Попробуйте — всё начинается с одного клика.</Text>
        </div>
        <section className="demo-card" aria-label="Демонстрация уведомления">
          <div className="demo-card-header">
            <Text as="h2" variant="subheader-2">Уведомление</Text>
            <span className="demo-badge">ИНТЕРАКТИВНЫЙ ПРИМЕР</span>
          </div>
          <div className="demo-body">
            <div className="preview-area">
              <div className="preview-label"><span className="small-dot" />ПРЕДПРОСМОТР</div>
              <div className="notification-illustration" aria-hidden="true">
                <div className="ghost-card ghost-card-back" />
                <div className="ghost-card ghost-card-front" />
                <div className={`preview-toast preview-toast-${type}`}>
                  <span className="message-symbol">{message.symbol}</span>
                  <div className="preview-toast-copy"><Text variant="subheader-1">{message.title}</Text><Text as="p" variant="body-1" color="secondary">{message.content}</Text></div>
                  <span className="preview-close">×</span><span className="preview-progress" />
                </div>
              </div>
              <div className="preview-caption"><Text as="p" variant="body-2">Сообщает. Не отвлекает.</Text><Text as="p" variant="body-1" color="secondary">Небольшая подсказка, чтобы двигаться дальше.</Text></div>
            </div>
            <div className="settings">
              <Text as="h3" variant="subheader-2">Сделайте его своим</Text>
              <Text as="p" variant="body-1" color="secondary" className="settings-description">Выберите настроение и время на экране.</Text>
              <div className="setting-field">
                <Text as="p" id="type-label" variant="body-2" className="field-label">Тип уведомления</Text>
                <SegmentedRadioGroup<MessageType> aria-labelledby="type-label" size="l" width="max" value={type} onUpdate={setType} options={Object.entries(messages).map(([value, item]) => ({value: value as MessageType, content: item.label}))} />
              </div>
              <div className="setting-field">
                <div className="field-label-row"><Text as="p" id="duration-label" variant="body-2" className="field-label">Время показа</Text><Text variant="caption-2" color="secondary">В СЕКУНДАХ</Text></div>
                <SegmentedRadioGroup aria-labelledby="duration-label" size="l" width="max" value={duration} onUpdate={setDuration} options={[{value: '3', content: '3 сек'}, {value: '5', content: '5 сек'}, {value: '8', content: '8 сек'}]} />
              </div>
              <div className="settings-note"><span className="note-symbol" aria-hidden="true">i</span><Text variant="body-1" color="secondary">Закроется автоматически. А если хочется раньше — нажмите на крестик.</Text></div>
            </div>
          </div>
          <div className="demo-card-footer">
            <div className={`demo-status ${visible ? 'demo-status-active' : ''}`} role="status"><span className="small-dot" />{visible ? 'Уведомление на экране' : 'Всё готово к показу'}</div>
            <Text variant="body-1" color="secondary">Кнопка в правом нижнем углу <span aria-hidden="true">↘</span></Text>
          </div>
        </section>
        <div className="feature-list">
          <div className="feature"><span className="feature-number">01</span><div><Text as="h3" variant="subheader-1">По вашему клику</Text><Text as="p" variant="body-1" color="secondary">Появится только тогда, когда вы решите.</Text></div></div>
          <div className="feature"><span className="feature-number">02</span><div><Text as="h3" variant="subheader-1">Всегда под рукой</Text><Text as="p" variant="body-1" color="secondary">В углу экрана, не перекрывая главное.</Text></div></div>
          <div className="feature"><span className="feature-number">03</span><div><Text as="h3" variant="subheader-1">Исчезнет само</Text><Text as="p" variant="body-1" color="secondary">Выберите время. Остальное — за нами.</Text></div></div>
        </div>
      </main>
      <footer className="page-footer"><Text variant="body-1" color="secondary">Меньше отвлечений. Больше ясности.</Text><span className="footer-edition">ДЕТАЛЬ № 001</span></footer>
      <div className="trigger-corner"><Text variant="caption-2" color="secondary">Немного внимания — по нажатию</Text><Button view="action" size="xl" onClick={showNotification} className="notification-trigger"><span className="trigger-plus" aria-hidden="true">+</span>Показать уведомление<span className="trigger-arrow" aria-hidden="true">↗</span></Button></div>
      <ToasterComponent className="notification-toaster" mobile={false} />
    </div>
  );
}

export function App() {
  const [toaster] = useState(() => new Toaster());
  return <ToasterProvider toaster={toaster}><NotificationPlayground /></ToasterProvider>;
}
