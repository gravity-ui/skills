import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import {useLanguage, type Language} from './i18n';
import './App.css';

export function App() {
  const {language, setLanguage, t, saved} = useLanguage();

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-mark" aria-hidden="true">w.</span>
        <span className="app-name">{t.appName}</span>
      </header>
      <main className="settings">
        <p className="eyebrow">{t.preferences}</p>
        <h1>{t.settings}</h1>
        <p className="subtitle">{t.subtitle}</p>

        <section className="language-card" aria-labelledby="language-heading">
          <div className="language-card-heading">
            <div className="language-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <ellipse cx="12" cy="12" rx="4" ry="9" />
                <path d="M3 12h18M5 6.5h14M5 17.5h14" />
              </svg>
            </div>
            <div>
              <h2 id="language-heading">{t.language}</h2>
              <p className="description" id="language-description">{t.description}</p>
            </div>
          </div>
          <SegmentedRadioGroup<Language>
            name="interface-language"
            size="xl"
            width="max"
            value={language}
            onUpdate={setLanguage}
            aria-labelledby="language-heading"
            aria-describedby="language-description"
          >
            <SegmentedRadioGroup.Option value="en">
              <span lang="en">English</span>
            </SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="ru">
              <span lang="ru">Русский</span>
            </SegmentedRadioGroup.Option>
          </SegmentedRadioGroup>
          <p className="language-hint">{t.instant}</p>
          <div className="current-language" aria-live="polite" aria-atomic="true">
            <span>{t.current}</span>
            <span className="language-value"><span className="status-dot" />{t.languageName}</span>
          </div>
        </section>
        <p className="save-note" role="status">
          <span aria-hidden="true">{saved ? '✓' : 'ⓘ'}</span> {saved ? t.saved : t.sessionOnly}
        </p>
      </main>
    </div>
  );
}
