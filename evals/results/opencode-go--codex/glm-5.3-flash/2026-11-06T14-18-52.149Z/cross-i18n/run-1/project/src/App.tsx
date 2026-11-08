import { Button, Card, Select } from '@gravity-ui/uikit';
import { useEffect } from 'react';

import { useI18n } from './i18n';
import type { Language } from './i18n';

export function App() {
  const { language, setLanguage, t } = useI18n();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
        <label htmlFor="language-select">{t('currentLanguage')}</label>
        <Select
          id="language-select"
          value={[language]}
          onUpdate={(value) => setLanguage(value[0] as Language)}
          width={160}
          options={[
            { value: 'en', content: 'English' },
            { value: 'ru', content: 'Русский' },
          ]}
        />
        <Button view="action" onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}>
          {t('switchLanguage')}
        </Button>
      </Card>
    </div>
  );
}
