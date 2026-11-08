import {Card, Select, Text} from '@gravity-ui/uikit';

import {isLanguage} from './i18n';
import {useLanguage} from './LanguageProvider';
import './App.css';

export function App() {
  const {language, setLanguage, t} = useLanguage();

  return (
    <main className="app">
      <header className="app-header">
        <Text as="h1" variant="header-1">{t('settings')}</Text>
        <Text as="p" variant="body-2" color="secondary">{t('settingsDescription')}</Text>
      </header>

      <Card className="language-card" view="outlined">
        <div className="language-setting">
          <div className="language-description">
            <Text as="h2" variant="subheader-2" id="language-label">{t('language')}</Text>
            <Text as="p" variant="body-1" color="secondary" id="language-description">
              {t('languageDescription')}
            </Text>
          </div>
          <Select
            className="language-select"
            aria-labelledby="language-label"
            aria-describedby="language-description"
            size="l"
            value={[language]}
            options={[
              {value: 'en', content: <span lang="en">English</span>},
              {value: 'ru', content: <span lang="ru">Русский</span>},
            ]}
            onUpdate={([value]) => {
              if (isLanguage(value)) setLanguage(value);
            }}
          />
        </div>
        <Text as="p" variant="body-1" color="secondary" className="language-note">
          {t('preferenceNote')}
        </Text>
      </Card>

      <div className="language-status" role="status" aria-live="polite" aria-atomic="true">
        <Text variant="body-1">{t('currentLanguage')}</Text>
      </div>
    </main>
  );
}
