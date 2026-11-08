import {Select, Text} from '@gravity-ui/uikit';

import {isLanguage, setLanguage, t, useLanguage} from './i18n';
import './App.css';

export function App() {
  const language = useLanguage();

  return (
    <main className="settings">
      <Text as="h1" variant="header-1">{t('title')}</Text>
      <Text as="p" variant="body-2" color="secondary">{t('description')}</Text>

      <section className="settings-card" aria-labelledby="language-heading">
        <div className="language-setting">
          <div className="language-description">
            <Text as="h2" id="language-heading" variant="subheader-2">
              {t('language')}
            </Text>
            <Text as="p" variant="body-1" color="secondary">{t('languageHint')}</Text>
          </div>
          <Select
            className="language-select"
            size="l"
            aria-labelledby="language-heading"
            value={[language]}
            options={[
              {value: 'en', content: 'English'},
              {value: 'ru', content: 'Русский'},
            ]}
            onUpdate={([value]) => {
              if (isLanguage(value)) setLanguage(value);
            }}
          />
        </div>
        <Text as="p" variant="body-1" color="secondary">{t('storageHint')}</Text>
      </section>
    </main>
  );
}
