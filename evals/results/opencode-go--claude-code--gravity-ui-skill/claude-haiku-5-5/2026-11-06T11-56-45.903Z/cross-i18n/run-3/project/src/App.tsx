import * as React from 'react';
import {Flex, Pagination, Text} from '@gravity-ui/uikit';

import {LANGUAGE_NAMES, LanguageProvider, useLanguage} from './i18n/LanguageProvider';
import {LanguageSwitcher} from './LanguageSwitcher';

function AppContent() {
  const {lang, t} = useLanguage();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  return (
    <Flex direction="column" gap={5} style={{padding: 24, maxWidth: 720}}>
      <Flex alignItems="center" gap={4}>
        <Text as="h1" variant="header-1" style={{flex: 1, minWidth: 0}}>
          {t('app_title')}
        </Text>
        <div style={{flexShrink: 0}}>
          <LanguageSwitcher />
        </div>
      </Flex>

      <Text variant="body-2" color="secondary">
        {t('app_description')}
      </Text>

      <Flex direction="column" gap={3}>
        <Text variant="subheader-2">{t('sample_title')}</Text>
        <Text variant="body-1">{t('current_language', {language: LANGUAGE_NAMES[lang]})}</Text>
        <Text variant="caption-2" color="secondary">
          {t('sample_hint')}
        </Text>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={120}
          pageSizeOptions={[10, 20, 50]}
          compact={false}
          onUpdate={(nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
        />
      </Flex>
    </Flex>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
