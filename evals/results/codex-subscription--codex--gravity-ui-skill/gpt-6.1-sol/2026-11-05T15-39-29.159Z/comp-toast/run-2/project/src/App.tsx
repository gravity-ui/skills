import {useState, type SVGProps} from 'react';
import {Button, Icon, Text, Toaster, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';
import './App.css';

function BellGlyph(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 21h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
}

function CheckGlyph(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none"><path d="m6 12 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function ClockGlyph(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function ArrowGlyph(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function NotificationDemo() {
  const {add} = useToaster();

  const showNotification = () => {
    add({
      name: 'success-notification',
      title: 'Всё получилось!',
      content: 'Ваши изменения успешно сохранены.',
      theme: 'success',
      autoHiding: 5000,
      isClosable: true,
    });
  };

  return (
    <div className="app">
      <header className="page-header">
        <div className="wordmark"><span className="brand-mark"><Icon data={BellGlyph} size={21}/></span><Text variant="header-2">toasty<span className="brand-period">.</span></Text></div>
        <Text variant="body-1" color="secondary" className="header-caption">Маленькие детали. Приятный опыт.</Text>
        <span className="header-badge"><span className="status-dot"/>Интерактивный пример</span>
      </header>

      <main className="main-content">
        <div className="intro">
          <div className="eyebrow"><span className="eyebrow-line"/>НА СВЯЗИ, БЕЗ ЛИШНИХ СЛОВ</div>
          <Text as="h1" variant="display-4" className="hero-title">Хорошие новости.<br/><span className="title-accent">В нужный момент.</span></Text>
          <Text as="p" variant="body-3" color="secondary" className="hero-description">Одно нажатие — и вы в курсе.<br/>Уведомление появится и исчезнет само.</Text>
        </div>

        <section className="preview" aria-label="Пример внешнего вида уведомления">
          <div className="preview-toolbar">
            <div className="window-dots" aria-hidden="true"><i/><i/><i/></div>
            <Text variant="caption-2" color="secondary">Так это выглядит</Text>
            <span className="preview-number">01 / 01</span>
          </div>
          <div className="preview-canvas">
            <span className="orbit orbit-one" aria-hidden="true"/>
            <span className="orbit orbit-two" aria-hidden="true"/>
            <div className="sample-notification">
              <span className="success-symbol"><Icon data={CheckGlyph} size={22}/></span>
              <div className="sample-copy"><Text as="p" variant="subheader-3">Всё получилось!</Text><Text as="p" variant="body-2" color="secondary">Ваши изменения успешно сохранены.</Text></div>
              <span className="sample-close" aria-hidden="true">×</span>
              <span className="sample-progress" aria-hidden="true"/>
            </div>
            <span className="preview-label"><span className="tiny-line"/>Немного внимания — и снова к делам</span>
          </div>
          <div className="preview-footer"><span className="preview-footer-dot"/><Text variant="body-1" color="secondary">Ненавязчиво. Понятно. Вовремя.</Text><span className="preview-footer-tag">Уведомление об успехе</span></div>
        </section>

        <div className="features">
          <div className="feature"><span className="feature-icon"><Icon data={BellGlyph} size={20}/></span><div><Text as="p" variant="subheader-2">Появляется по клику</Text><Text as="p" variant="body-1" color="secondary">Вы решаете, когда попробовать</Text></div></div>
          <span className="feature-divider" aria-hidden="true"/>
          <div className="feature"><span className="feature-icon"><Icon data={ClockGlyph} size={20}/></span><div><Text as="p" variant="subheader-2">Исчезает через 5 секунд</Text><Text as="p" variant="body-1" color="secondary">Закроется само или по крестику</Text></div></div>
        </div>
      </main>

      <footer className="page-footer"><Text variant="body-1" color="hint">Меньше шума, больше ясности.</Text><span className="footer-index">TOASTY / 001</span></footer>

      <div className="corner-action">
        <span className="action-hint">Попробуйте — это всего один клик <span aria-hidden="true">↘</span></span>
        <Button view="action" size="xl" className="show-button" onClick={showNotification}><Button.Icon><Icon data={BellGlyph} size={20}/></Button.Icon>Показать уведомление<Button.Icon side="right"><Icon data={ArrowGlyph} size={19}/></Button.Icon></Button>
      </div>
      <ToasterComponent className="notification-stack"/>
    </div>
  );
}

export function App() {
  const [toaster] = useState(() => new Toaster());
  return <ToasterProvider toaster={toaster}><NotificationDemo/></ToasterProvider>;
}
