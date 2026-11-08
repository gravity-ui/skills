import {useEffect, useState} from 'react';
import {RadioGroup, SegmentedRadioGroup, ThemeProvider} from '@gravity-ui/uikit';
import {getInitialLanguage, isLanguage, messages, type Language} from './i18n';
import './App.css';

function Globe({className = ''}: {className?: string}) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18M5 6.5h14M5 17.5h14" />
    </svg>
  );
}

function Check() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const t = messages[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.pageTitle;
    try {
      localStorage.setItem('app-language', language);
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [language, t.pageTitle]);

  function changeLanguage(value: string) {
    if (isLanguage(value)) setLanguage(value);
  }

  return (
    <ThemeProvider lang={language}>
      <div className="app-shell">
        <header className="app-header">
          <div className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>{t.appName}</div>
          <div className="quick-language">
            <Globe />
            <SegmentedRadioGroup value={language} onUpdate={changeLanguage} aria-label={t.interfaceLanguage} size="m">
              <SegmentedRadioGroup.Option value="en" content={<span lang="en">EN</span>} />
              <SegmentedRadioGroup.Option value="ru" content={<span lang="ru">RU</span>} />
            </SegmentedRadioGroup>
          </div>
        </header>

        <main className="settings-page">
          <div className="eyebrow"><span className="eyebrow-line" />{t.preferences}</div>
          <h1>{t.settings}</h1>
          <p className="page-description">{t.description}</p>

          <section className="language-panel" aria-labelledby="language-heading">
            <div className="panel-heading">
              <span className="section-icon"><Globe /></span>
              <div><h2 id="language-heading">{t.language}</h2><p>{t.languageDescription}</p></div>
            </div>

            <RadioGroup
              className="language-options"
              optionClassName="language-option"
              name="interface-language"
              value={language}
              onUpdate={changeLanguage}
              aria-label={t.interfaceLanguage}
              options={([
                {value: 'en', native: 'English', translation: t.english, letter: 'Aa', code: 'EN'},
                {value: 'ru', native: 'Русский', translation: t.russian, letter: 'Ая', code: 'RU'},
              ] as const).map((option) => ({
                value: option.value,
                content: <span className="language-card-content">
                  <span className="language-card-top"><span className="language-letter" lang={option.value}>{option.letter}</span><span className="language-code">{option.code}</span></span>
                  <span className="language-name" lang={option.value}>{option.native}</span>
                  <span className="language-translation">{option.translation}</span>
                  <span className={`selection-label ${language === option.value ? 'is-selected' : ''}`}>
                    {language === option.value ? <><Check />{t.selected}</> : t.selectLanguage}
                  </span>
                </span>,
              }))}
            />

            <div className="save-note" role="status"><span className="note-icon"><Check /></span>{storageAvailable ? t.savedNote : t.sessionNote}</div>
          </section>

          <section className="preview" aria-labelledby="preview-heading">
            <div className="preview-label"><span className="live-dot" /><h2 id="preview-heading">{t.preview}</h2><span className="preview-rule" /></div>
            <div className="preview-content">
              <span className="welcome-icon" aria-hidden="true">✦</span>
              <div><h3>{t.welcome}</h3><p>{t.welcomeDescription}</p></div>
              <span className="preview-badge">{t.currentLanguage}</span>
            </div>
          </section>

          <footer className="page-footer"><Globe /><span>{t.footer}</span></footer>
        </main>
      </div>
    </ThemeProvider>
  );
}
