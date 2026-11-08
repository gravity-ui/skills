import * as React from 'react';
import { Flex, Pagination, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { isLang } from './i18n';

const LANGUAGE_OPTIONS = [
  { value: 'en', content: 'English' },
  { value: 'ru', content: 'Русский' },
];

function Screen() {
  const { lang, setLang, t } = useLanguage();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  return (
    <Flex direction="column" gap={6} style={{ padding: 24, maxWidth: 720 }}>
      <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
        <Text variant="header-1">{t('title')}</Text>
        <SegmentedRadioGroup
          aria-label={t('language_label')}
          value={lang}
          options={LANGUAGE_OPTIONS}
          onUpdate={(value) => {
            if (isLang(value)) {
              setLang(value);
            }
          }}
        />
      </Flex>

      <Text variant="body-1">{t('description')}</Text>

      <Flex direction="column" gap={3}>
        <Text variant="subheader-2">{t('pagination_title')}</Text>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={250}
          pageSizeOptions={[10, 20, 50]}
          onUpdate={(nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
        />
        <Text variant="body-1" color="secondary">
          {t('page_info', { page })}
        </Text>
      </Flex>
    </Flex>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <Screen />
    </LanguageProvider>
  );
}
