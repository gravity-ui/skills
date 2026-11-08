import React from 'react';
import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { appI18n, appLanguages, useAppLanguage, type AppLanguage } from './i18n';

export function App() {
  const { language, setLanguage } = useAppLanguage();
  const t = appI18n.keyset('app');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <SegmentedRadioGroup
        value={language}
        onUpdate={(nextLanguage) => setLanguage(nextLanguage as AppLanguage)}
        aria-label={t('language')}
      >
        {appLanguages.map((languageOption) => (
          <SegmentedRadioGroup.Option
            key={languageOption}
            value={languageOption}
            content={t(languageOption)}
          />
        ))}
      </SegmentedRadioGroup>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
