import * as React from 'react';
import { Card, ClipboardButton, Flex, Pagination, Text, TextInput } from '@gravity-ui/uikit';

import { i18n } from './i18n/keysets';
import { LanguageProvider, useLanguage } from './i18n/LanguageProvider';
import { LanguageSwitcher } from './i18n/LanguageSwitcher';

function Content() {
  const { lang } = useLanguage();
  const { t } = i18n.useTranslation();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <Flex direction="column" gap={4}>
        <Flex justifyContent="space-between" alignItems="center" gap={4}>
          <Text variant="header-2">{t('title')}</Text>
          <LanguageSwitcher />
        </Flex>

        <Text color="secondary">{t('description')}</Text>
        <Text>{t('current-language', { name: t(`lang_${lang}`) })}</Text>

        <Card view="outlined" style={{ padding: 16 }}>
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">{t('section_demo')}</Text>
            <TextInput
              label={t('label_search')}
              placeholder={t('placeholder_search')}
              value={search}
              onUpdate={setSearch}
              hasClear
            />
            <Flex alignItems="center" gap={2}>
              <Text>{t('label_copy')}</Text>
              <ClipboardButton text={t('label_copy')} />
            </Flex>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={200}
              showInput
              pageSizeOptions={[10, 20, 50]}
              onUpdate={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          </Flex>
        </Card>
      </Flex>
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <Content />
    </LanguageProvider>
  );
}
