import * as React from 'react';
import { Box, Flex, Pagination, Select, SegmentedRadioGroup, Text, TextInput } from '@gravity-ui/uikit';

import { type AppKey, type AppLang, t } from './i18n/i18n';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

const CITIES: { value: string; labelKey: AppKey }[] = [
  { value: 'moscow', labelKey: 'cityMoscow' },
  { value: 'berlin', labelKey: 'cityBerlin' },
  { value: 'new-york', labelKey: 'cityNewYork' },
];

const LANGUAGE_OPTIONS: { value: AppLang; content: string }[] = [
  { value: 'en', content: 'English' },
  { value: 'ru', content: 'Русский' },
];

const TOTAL_ITEMS = 100;

export function App() {
  return (
    <LanguageProvider>
      <Demo />
    </LanguageProvider>
  );
}

function Demo() {
  const { lang, setLang } = useLanguage();
  const [name, setName] = React.useState('');
  const [city, setCity] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const pages = Math.ceil(TOTAL_ITEMS / pageSize);

  return (
    <Box spacing={{ p: 6 }} style={{ maxWidth: 640, margin: '0 auto' }}>
      <Flex direction="column" gap={6}>
        <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
          <Text variant="header-1">{t('title')}</Text>
          <SegmentedRadioGroup<AppLang>
            aria-label={t('language')}
            value={lang}
            onUpdate={(value) => setLang(value)}
            options={LANGUAGE_OPTIONS}
          />
        </Flex>

        <Text variant="body-2" color="secondary">
          {t('description')}
        </Text>

        <TextInput
          label={t('nameLabel')}
          placeholder={t('namePlaceholder')}
          value={name}
          onUpdate={setName}
          hasClear
        />

        <Select
          label={t('cityLabel')}
          placeholder={t('cityPlaceholder')}
          value={city ? [city] : []}
          onUpdate={(values) => setCity(values[0] ?? '')}
          options={CITIES.map((item) => ({ value: item.value, content: t(item.labelKey) }))}
          hasClear
          width="max"
        />

        <Flex direction="column" gap={2}>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={TOTAL_ITEMS}
            onUpdate={(nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            }}
          />
          <Text variant="caption-2" color="secondary">
            {t('pageStatus', { page, pages })}
          </Text>
        </Flex>

        <Text variant="caption-2" color="secondary">
          {t('savedHint')}
        </Text>
      </Flex>
    </Box>
  );
}
