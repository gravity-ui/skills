import {useSyncExternalStore} from 'react';
import {Select, Text} from '@gravity-ui/uikit';

import {getLanguage, isLanguage, setLanguage, subscribeLanguage, t} from './i18n';
import './App.css';

export function App() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage);

  return (
    <main className="settings">
      <Text as="h1" variant="header-2" className="settings__title">
        {t('title')}
      </Text>
      <Text as="p" variant="body-2" color="secondary">
        {t('description')}
      </Text>

      <section className="settings__language" aria-labelledby="language-label">
        <div className="settings__copy">
          <Text as="h2" id="language-label" variant="subheader-2" className="settings__title">
            {t('language')}
          </Text>
          <Text as="p" variant="body-1" color="secondary">
            {t('languageDescription')}
          </Text>
        </div>
        <Select
          size="l"
          className="settings__select"
          aria-labelledby="language-label"
          value={[language]}
          options={[
            {value: 'en', content: <span lang="en">English</span>, text: 'English'},
            {value: 'ru', content: <span lang="ru">Русский</span>, text: 'Русский'},
          ]}
          onUpdate={([value]) => {
            if (isLanguage(value)) setLanguage(value);
          }}
        />
      </section>
      <Text as="p" variant="body-1" color="secondary" role="status">
        {t('currentLanguage')}
      </Text>
    </main>
  );
}
