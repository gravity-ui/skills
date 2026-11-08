import {useEffect, useState} from 'react';
import {Button, Modal, ThemeProvider} from '@gravity-ui/uikit';
import {copy, getBrowserLanguage, getInitialLanguage, LANGUAGE_STORAGE_KEY, type Language} from './i18n';
import './styles.css';

function Icon({name, size = 20}: {name: 'globe' | 'check' | 'arrow' | 'info' | 'help' | 'close' | 'calendar' | 'chevron' | 'spark' | 'grid' | 'shield'; size?: number}) {
  const paths = {
    globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3v.1"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 11h16m-11 4h.1m5 0h.1"/></>,
    chevron: <path d="m9 6 6 6-6 6"/>,
    spark: <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z"/>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [canSave, setCanSave] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const t = copy[language];
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${copy[language].title} · Orbit`;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      setCanSave(true);
    } catch {
      setCanSave(false);
    }
  }, [language]);

  useEffect(() => {
    const syncLanguage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY || event.key === null) {
        setLanguage(event.newValue === 'en' || event.newValue === 'ru' ? event.newValue : getBrowserLanguage());
      }
    };
    window.addEventListener('storage', syncLanguage);
    return () => window.removeEventListener('storage', syncLanguage);
  }, []);

  return (
    <ThemeProvider theme="light" lang={language}>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-group">
            <a className="brand" href="#main" aria-label="Orbit"><span className="brand-mark"><span/></span>orbit<span className="brand-dot">.</span></a>
            <span className="header-divider"/>
            <span className="workspace-name">{t.personalWorkspace}</span>
          </div>
          <div className="header-actions">
            <div className="quick-language" role="group" aria-label={t.interfaceLanguage}>
              <Icon name="globe" size={16}/>
              <button lang="en" aria-label="English" aria-pressed={language === 'en'} className={language === 'en' ? 'current' : ''} onClick={() => setLanguage('en')}>EN</button>
              <span className="toggle-divider"/>
              <button lang="ru" aria-label="Русский" aria-pressed={language === 'ru'} className={language === 'ru' ? 'current' : ''} onClick={() => setLanguage('ru')}>RU</button>
            </div>
            <span className="header-divider"/>
            <Button view="flat" className="help-button" aria-label={t.help} title={t.help} onClick={() => setHelpOpen(true)}><Icon name="help"/></Button>
            <span className="avatar" aria-label={t.profile}>JD</span>
          </div>
        </header>

        <main id="main" className="main">
          <nav className="breadcrumbs" aria-label={t.breadcrumbs}><span>{t.settings}</span><Icon name="chevron" size={13}/><span>{t.preferences}</span></nav>
          <div className="page-heading">
            <div><div className="eyebrow">{t.makeItYours}</div><h1>{t.title}</h1><p>{t.description}</p></div>
            <div className="heading-art" aria-hidden="true"><span className="art-orbit"/><span className="art-letter art-letter-a">A</span><span className="art-letter art-letter-ya">Я</span><span className="art-spark">✦</span><span className="art-dot"/></div>
          </div>

          <div className="content-grid">
            <div className="settings-column">
              <section className="panel language-panel" aria-labelledby="language-heading">
                <div className="section-heading"><span className="section-icon"><Icon name="globe" size={21}/></span><div><h2 id="language-heading">{t.interfaceLanguage}</h2><p>{t.chooseLanguage}</p></div></div>
                <fieldset className="language-options"><legend className="sr-only">{t.interfaceLanguage}</legend>
                  {(['en', 'ru'] as const).map((option) => (
                    <label key={option} className={`language-option ${language === option ? 'selected' : ''}`}>
                      <input type="radio" name="interface-language" value={option} checked={language === option} onChange={() => setLanguage(option)}/>
                      <span className="language-monogram" aria-hidden="true">{option === 'en' ? 'Aa' : 'Яя'}</span>
                      <span className="language-name" lang={option}>{option === 'en' ? 'English' : 'Русский'}</span>
                      <span className="language-description">{option === 'en' ? t.english : t.russian}</span>
                      <span className="language-code">{option === 'en' ? 'EN' : 'RU'}</span>
                      <span className="radio-indicator">{language === option && <Icon name="check" size={12}/>}</span>
                    </label>
                  ))}
                </fieldset>
                <div className="instant-note"><Icon name="spark" size={16}/><span>{t.instant}</span></div>
                <div className={`save-status ${canSave ? '' : 'save-unavailable'}`} role="status" aria-live="polite"><span className="status-check"><Icon name={canSave ? 'check' : 'info'} size={13}/></span><span>{canSave ? t.saved : t.notSaved}</span><span className="status-device">{canSave ? t.onThisDevice : t.thisSession}</span></div>
              </section>

              <section className="panel formats-panel" aria-labelledby="formats-heading">
                <div className="section-heading"><span className="section-icon neutral"><Icon name="calendar" size={21}/></span><div><h2 id="formats-heading">{t.regionalFormats}</h2><p>{t.formatsDescription}</p></div><span className="locale-badge">{locale}</span></div>
                <dl className="format-list">
                  <div><dt>{t.date}</dt><dd>{new Intl.DateTimeFormat(locale, {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'}).format(new Date('2026-11-05T12:00:00Z'))}</dd></div>
                  <div><dt>{t.number}</dt><dd>{new Intl.NumberFormat(locale, {minimumFractionDigits: 2}).format(1234567.89)}</dd></div>
                </dl>
              </section>
              <div className="browser-default"><span>{t.browserHint}</span><button onClick={() => setLanguage(getBrowserLanguage())}>{t.useBrowser}<Icon name="arrow" size={15}/></button></div>
            </div>

            <aside className="preview-column">
              <section className="preview-panel" aria-labelledby="preview-heading">
                <div className="preview-heading"><span id="preview-heading">{t.livePreview}</span><span className="live-dot"/></div>
                <div className="preview-window">
                  <div className="window-bar"><span/><span/><span/><span className="window-brand">orbit.</span></div>
                  <div className="preview-content">
                    <div className="welcome-icon"><Icon name="spark" size={24}/></div>
                    <span className="preview-greeting">{t.hello}</span>
                    <h3>{t.welcome}</h3><p>{t.previewDescription}</p>
                    <div className="sample-project"><span className="project-icon"><Icon name="grid" size={19}/></span><div><strong>{t.yourWorkspace}</strong><span>{t.everythingInPlace}</span></div><Icon name="chevron" size={15}/></div>
                    <div className="preview-stats"><div><strong>12<span className="stat-dot purple"/></strong><span>{t.projects}</span></div><div><strong>4<span className="stat-dot peach"/></strong><span>{t.teammates}</span></div></div>
                    <div className="preview-bottom"><span className="mini-avatars"><span>JD</span><span>AK</span><span>ML</span></span><span>{t.betterTogether}</span></div>
                  </div>
                </div>
                <p className="preview-caption"><Icon name="globe" size={14}/>{t.previewCaption}</p>
              </section>
              <section className="good-to-know"><span className="info-icon"><Icon name="info" size={18}/></span><div><h3>{t.goodToKnow}</h3><p>{t.personalOnly}</p></div></section>
              <div className="privacy-note"><Icon name="shield" size={15}/><span>{t.contentUnchanged}</span></div>
            </aside>
          </div>

          <footer className="page-footer"><span>© {new Date().getFullYear()} Orbit</span><span>{t.footer}<span className="footer-star">✦</span></span></footer>
        </main>

        <Modal open={helpOpen} onOpenChange={setHelpOpen} aria-labelledby="help-title">
          <div className="help-modal"><div className="modal-heading"><span className="section-icon"><Icon name="help"/></span><Button view="flat" aria-label={t.close} onClick={() => setHelpOpen(false)}><Icon name="close"/></Button></div><h2 id="help-title">{t.helpTitle}</h2><p>{t.helpDescription}</p><Button view="action" size="l" width="max" onClick={() => setHelpOpen(false)}>{t.gotIt}</Button></div>
        </Modal>
      </div>
    </ThemeProvider>
  );
}
