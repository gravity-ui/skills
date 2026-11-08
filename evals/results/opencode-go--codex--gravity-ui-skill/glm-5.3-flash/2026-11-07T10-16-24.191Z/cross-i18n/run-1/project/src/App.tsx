import { Lang, Select, useLang, useTheme } from '@gravity-ui/uikit';
import { useMemo, useState } from 'react';

import { appLanguages, i18n, languageNames, setAppLanguage, type AppLanguage } from './i18n';

export function App() {
  const [language, setLanguage] = useState<AppLanguage>(Lang.En);
  const [selectedLanguage, setSelectedLanguage] = useState<string[]>([language]);
  const { lang } = useLang();
  const theme = useTheme();

  const keyset = useMemo(() => i18n.keyset('app'), [lang]);

  const handleLanguageChange = (value: string[]) => {
    const nextLanguage = value[0] as AppLanguage;
    setLanguage(nextLanguage);
    setSelectedLanguage([nextLanguage]);
    setAppLanguage(nextLanguage);
  };

  return (
    <div
      style={{
        padding: 24,
        minHeight: '100vh',
        boxSizing: 'border-box',
        color: 'var(--g-color-text-primary)',
        background: theme === 'dark' ? 'var(--g-color-base-background)' : undefined,
      }}
    >
      <label style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <span>{keyset('language')}</span>
        <Select
          value={selectedLanguage}
          onUpdate={handleLanguageChange}
          options={appLanguages.map((language) => ({
            value: language,
            text: languageNames[language],
          }))}
        />
      </label>
      <p>{keyset('content')}</p>
    </div>
  );
}
