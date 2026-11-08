import {useState} from 'react';
import {Select} from '@gravity-ui/uikit';
import {LocaleProvider, useLocale} from './i18n';
import './App.css';

function Globe({size = 20}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18M5 6.5h14M5 17.5h14" />
    </svg>
  );
}

function Check() {
  return <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 10 3.5 3.5L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Preferences() {
  const {language, setLanguage, t, saved} = useLocale();
  const [previewDate] = useState(() => new Date());
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#main" aria-label={t.home}>
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          forma<span className="brand-dot">.</span>
        </a>
        <div className="header-end">
          <div className="language-select">
            <Globe size={18} />
            <Select
              aria-label={t.selectLanguage}
              value={[language]}
              onUpdate={([value]) => {
                if (value === 'en' || value === 'ru') setLanguage(value);
              }}
              options={[{value: 'en', content: 'English'}, {value: 'ru', content: 'Русский'}]}
              filterable
              filterPlaceholder={t.searchLanguage}
              size="l"
              width={132}
            />
          </div>
          <span className="header-divider" />
          <span className="avatar" aria-label={t.personalWorkspace}>F</span>
        </div>
      </header>

      <main id="main" className="main-content">
        <div className="eyebrow"><span className="eyebrow-line" />{t.preferences}</div>
        <div className="page-heading">
          <h1>{t.heading}</h1>
          <p>{t.description}</p>
        </div>

        <section className="settings-card" aria-labelledby="language-heading">
          <div className="section-heading">
            <span className="section-icon"><Globe size={23} /></span>
            <div><h2 id="language-heading">{t.interfaceLanguage}</h2><p>{t.languageDescription}</p></div>
          </div>

          <fieldset className="language-options">
            <legend className="sr-only">{t.selectLanguage}</legend>
            {(['en', 'ru'] as const).map((option) => (
              <label className={`language-option${language === option ? ' is-selected' : ''}`} key={option}>
                <input type="radio" name="interface-language" aria-label={option === 'en' ? 'English' : 'Русский'} value={option} checked={language === option} onChange={() => setLanguage(option)} />
                <span className="language-monogram" aria-hidden="true">{option === 'en' ? 'Aa' : 'Яя'}</span>
                <span className="language-name"><strong lang={option}>{option === 'en' ? 'English' : 'Русский'}</strong><span>{option === 'en' ? t.english : t.russian}</span></span>
                <span className="radio-indicator" aria-hidden="true">{language === option && <Check />}</span>
              </label>
            ))}
          </fieldset>

          <div className="instant-note"><span className="sparkle" aria-hidden="true">✧</span>{t.instantNote}</div>

          <div className="preview-section">
            <div className="preview-heading"><h3>{t.preview}</h3><span>{t.previewHint}</span></div>
            <div className="preview-card">
              <div className="preview-top"><span className="preview-label">{t.yourWorkspace}</span><span className="locale-tag">{locale}</span></div>
              <h4>{t.welcome}</h4>
              <p className="preview-description">{t.welcomeDescription}</p>
              <div className="format-examples">
                <div><span>{t.dateFormat}</span><strong>{new Intl.DateTimeFormat(locale, {day: 'numeric', month: 'long', year: 'numeric'}).format(previewDate)}</strong></div>
                <div><span>{t.numberFormat}</span><strong>{new Intl.NumberFormat(locale, {minimumFractionDigits: 2}).format(12345.67)}</strong></div>
              </div>
              <div className="preview-status"><span className="status-dot" />{t.upToDate}</div>
            </div>
          </div>

          <div className="card-footer" role="status" aria-live="polite" aria-atomic="true">
            <span className="saved-icon"><Check /></span>
            <span>{saved ? t.saved : t.applied}</span>
            <span className="auto-save-label">{t.autoSave}</span>
          </div>
        </section>
        <footer className="page-footer"><Globe size={15} /><span>{saved ? t.browserNote : t.sessionNote}</span></footer>
      </main>
      <div className="bottom-note">forma<span> / </span>{t.yourSpace}</div>
    </div>
  );
}

export function App() {
  return <LocaleProvider><Preferences /></LocaleProvider>;
}
