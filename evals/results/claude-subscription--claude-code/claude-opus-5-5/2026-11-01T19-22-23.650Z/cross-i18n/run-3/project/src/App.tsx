import * as React from 'react';
import {
  Button,
  Card,
  ClipboardButton,
  Flex,
  Pagination,
  SegmentedRadioGroup,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

import { type AppLang, useAppLang } from './i18n/LangProvider';
import { appI18n } from './i18n/keyset';

function LanguageSwitcher() {
  const { lang, setLang } = useAppLang();
  const { t } = appI18n.useTranslation();

  return (
    <Flex alignItems="center" gap={2}>
      <Text color="secondary">{t('label_language')}</Text>
      <SegmentedRadioGroup<AppLang>
        aria-label={t('label_language')}
        value={lang}
        onUpdate={setLang}
      >
        <SegmentedRadioGroup.Option value="en">English</SegmentedRadioGroup.Option>
        <SegmentedRadioGroup.Option value="ru">Русский</SegmentedRadioGroup.Option>
      </SegmentedRadioGroup>
    </Flex>
  );
}

export function App() {
  const { t } = appI18n.useTranslation();
  const [name, setName] = React.useState('');
  const [count, setCount] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const greeting = name.trim() ? t('greeting', { name: name.trim() }) : t('greeting_anonymous');

  return (
    <Flex direction="column" gap={4} style={{ padding: 24, maxWidth: 720 }}>
      <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
        <Text variant="header-2">{t('title')}</Text>
        <LanguageSwitcher />
      </Flex>

      <Text color="secondary">{t('description')}</Text>

      <Card view="outlined" style={{ padding: 16 }}>
        <Flex direction="column" gap={3}>
          <TextInput
            label={t('label_name')}
            placeholder={t('placeholder_name')}
            value={name}
            onUpdate={setName}
            hasClear
          />
          <Flex alignItems="center" gap={2}>
            <Text variant="subheader-2">{greeting}</Text>
            <ClipboardButton text={greeting} size="s" aria-label={t('label_copy')} />
          </Flex>
          <Flex alignItems="center" gap={2}>
            <Text>{t('label_items', { count })}</Text>
            <Button view="action" onClick={() => setCount((c) => c + 1)}>
              {t('button_add')}
            </Button>
            <Button onClick={() => setCount(1)}>{t('button_reset')}</Button>
          </Flex>
        </Flex>
      </Card>

      <Card view="outlined" style={{ padding: 16 }}>
        <Flex direction="column" gap={3}>
          <Text variant="subheader-2">{t('section_library')}</Text>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={250}
            pageSizeOptions={[10, 25, 50]}
            onUpdate={(nextPage, nextSize) => {
              setPage(nextPage);
              setPageSize(nextSize);
            }}
            showInput
          />
        </Flex>
      </Card>
    </Flex>
  );
}
