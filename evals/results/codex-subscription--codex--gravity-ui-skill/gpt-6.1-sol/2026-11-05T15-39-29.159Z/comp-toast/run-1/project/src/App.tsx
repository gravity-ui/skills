import {useRef, useState} from 'react';
import {Button, Icon, SegmentedRadioGroup, Text, Toast, Toaster, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';
import './App.css';

// Original line illustrations rendered through Gravity UI's Icon.
function BellArtwork() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 2V1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
}
function ClockArtwork() {
  return <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function LayersArtwork() {
  return <svg viewBox="0 0 24 24" fill="none"><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const messages = {
  success: {label: 'Успех', title: 'Всё получилось!', content: 'Изменения сохранены. Можно двигаться дальше.'},
  info: {label: 'Информация', title: 'Вы в курсе событий', content: 'Новое обновление уже доступно. Загляните, когда будет удобно.'},
  warning: {label: 'Внимание', title: 'Обратите внимание', content: 'Перед продолжением проверьте внесённые изменения.'},
} as const;
type MessageType = keyof typeof messages;

function NotificationPlayground() {
  const [type, setType] = useState<MessageType>('success');
  const [duration, setDuration] = useState('5');
  const sequence = useRef(0);
  const toaster = useToaster();
  const message = messages[type];

  function showNotification() {
    toaster.removeAll();
    toaster.add({
      name: `notification-${++sequence.current}`,
      theme: type,
      title: message.title,
      content: message.content,
      autoHiding: Number(duration) * 1000,
      isClosable: true,
    });
  }

  return (
    <div className="playground">
      <header className="page-header">
        <div className="wordmark" aria-label="Notify">
          <span className="brand-mark" aria-hidden="true"><i/><i/><i/></span>
          <Text variant="header-1">notify<span className="brand-period">.</span></Text>
        </div>
        <div className="header-divider" />
        <Text variant="body-2" color="secondary" className="header-caption">Маленькие детали большого опыта</Text>
        <span className="library-label"><span className="library-dot"/>Меньше шума. Больше смысла.</span>
      </header>

      <main className="main-content">
        <div className="breadcrumb"><span>Компоненты</span><span aria-hidden="true">/</span><span>Уведомления</span></div>
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-icon"><Icon data={BellArtwork} size={27}/><span className="notification-dot"/></div>
          <Text as="h1" variant="display-3" id="page-title" className="page-title">Сообщить. И не отвлекать.</Text>
          <Text as="p" variant="body-3" color="secondary" className="intro-description">Важное сообщение в нужный момент.<br/>Появляется по нажатию и исчезает само.</Text>
        </section>

        <section className="demo-card" aria-label="Настройки уведомления">
          <div className="card-header">
            <Text variant="subheader-2">Ваше уведомление</Text>
            <span className="preview-label"><span/>Предпросмотр</span>
          </div>
          <div className="preview-stage">
            <div className="preview-toast-wrap" key={type}>
              <Toast name="preview" theme={type} title={message.title} content={message.content} autoHiding={false} isClosable={false} removeCallback={() => {}} className="preview-toast"/>
              <div className="preview-caption"><span className={`preview-line preview-line-${type}`}/><Text variant="caption-2" color="secondary">Немного внимания. Ничего лишнего.</Text></div>
            </div>
            <span className="stage-corner stage-corner-top" aria-hidden="true"/>
            <span className="stage-corner stage-corner-bottom" aria-hidden="true"/>
          </div>
          <div className="settings">
            <div className="setting-group">
              <Text as="div" variant="body-2" className="setting-label" id="type-label">Тип сообщения</Text>
              <SegmentedRadioGroup<MessageType> size="l" value={type} onUpdate={setType} aria-labelledby="type-label" width="max">
                {Object.entries(messages).map(([value, item]) => (
                  <SegmentedRadioGroup.Option key={value} value={value as MessageType}><span className="type-option"><span className={`type-dot type-dot-${value}`}/>{item.label}</span></SegmentedRadioGroup.Option>
                ))}
              </SegmentedRadioGroup>
            </div>
            <div className="setting-group duration-group">
              <Text as="div" variant="body-2" className="setting-label" id="duration-label">Время на экране</Text>
              <SegmentedRadioGroup size="l" value={duration} onUpdate={setDuration} aria-labelledby="duration-label" width="max" options={[{value: '3', content: '3 сек'}, {value: '5', content: '5 сек'}, {value: '8', content: '8 сек'}]}/>
            </div>
          </div>
          <div className="card-footer"><Icon data={ClockArtwork} size={16}/><Text variant="body-1" color="secondary">Закроется автоматически через {duration} сек. Можно закрыть раньше.</Text></div>
        </section>

        <div className="features">
          <div className="feature"><span className="feature-icon"><Icon data={LayersArtwork} size={21}/></span><div><Text as="div" variant="subheader-1">Всё остаётся на месте</Text><Text as="p" variant="body-1" color="secondary">Не перекрывает экран и не прерывает работу</Text></div></div>
          <div className="feature"><span className="feature-icon"><Icon data={ClockArtwork} size={21}/></span><div><Text as="div" variant="subheader-1">Исчезает само</Text><Text as="p" variant="body-1" color="secondary">Ровно столько внимания, сколько нужно</Text></div></div>
        </div>
        <div className="try-hint"><span className="hint-line"/><Text variant="body-1" color="hint">Всё готово. Нажмите кнопку в углу экрана</Text><span className="hint-arrow" aria-hidden="true">↘</span></div>
      </main>
      <footer className="page-footer"><Text variant="caption-2" color="hint">Хороший интерфейс — в деталях.</Text><Text variant="caption-2" color="hint">КОМПОНЕНТ 001</Text></footer>
      <div className="floating-action">
        <span className="floating-caption">Попробуем?</span>
        <Button view="action" size="xl" className="notification-button" onClick={showNotification}><Icon data={BellArtwork} size={20}/>Показать уведомление<span className="button-plus" aria-hidden="true">+</span></Button>
      </div>
      <ToasterComponent className="notification-toaster" mobile={false}/>
    </div>
  );
}

export function App() {
  const [toaster] = useState(() => new Toaster());
  return <ToasterProvider toaster={toaster}><NotificationPlayground/></ToasterProvider>;
}
