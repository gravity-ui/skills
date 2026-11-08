import React from 'react';
import { Pagination, SegmentedRadioGroup, Select, Text } from '@gravity-ui/uikit';

import { LANGUAGES, useI18n } from './i18n';
import type { Language } from './i18n';

export function App() {
  const { t, language, setLanguage } = useI18n();
  const [fruit, setFruit] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);

  const languageNames: Record<Language, string> = {
    en: t('english'),
    ru: t('russian'),
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <Text variant="header-1">{t('title')}</Text>
      <Text color="secondary">{t('description')}</Text>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Text>{t('languageLabel')}:</Text>
        <SegmentedRadioGroup
          aria-label={t('languageLabel')}
          value={language}
          onUpdate={(value) => setLanguage(value as Language)}
        >
          {LANGUAGES.map((lang) => (
            <SegmentedRadioGroup.Option key={lang} value={lang}>
              {languageNames[lang]}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </div>

      <Select
        label={`${t('selectLabel')}:`}
        placeholder={t('selectPlaceholder')}
        value={fruit}
        onUpdate={setFruit}
        options={[
          { value: 'apple', content: t('apple') },
          { value: 'banana', content: t('banana') },
          { value: 'cherry', content: t('cherry') },
        ]}
      />

      <Text color="secondary">{t('paginationHint')}</Text>
      <Pagination
        page={page}
        pageSize={10}
        total={100}
        onUpdate={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
