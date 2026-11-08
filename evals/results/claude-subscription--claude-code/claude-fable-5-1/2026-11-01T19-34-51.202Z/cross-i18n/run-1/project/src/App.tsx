import React from 'react';
import {
  Alert,
  Button,
  Card,
  ClipboardButton,
  Flex,
  Pagination,
  Select,
  Table,
  Text,
  TextInput,
} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import {LanguageSwitcher} from './components/LanguageSwitcher';
import {I18nProvider, useI18n} from './i18n/I18nProvider';
import type {TranslationKey} from './i18n';

const CITY_KEYS = ['moscow', 'london', 'berlin', 'tokyo'] as const;
const ITEM_KEYS = ['apples', 'bread', 'milk', 'cheese', 'coffee', 'tea', 'eggs'] as const;
const ITEM_COUNTS: Record<(typeof ITEM_KEYS)[number], number> = {
  apples: 12,
  bread: 2,
  milk: 3,
  cheese: 1,
  coffee: 5,
  tea: 8,
  eggs: 30,
};
const PAGE_SIZE = 3;

interface Row {
  id: string;
  item: string;
  count: number;
}

function Page() {
  const {lang, t} = useI18n();
  const [name, setName] = React.useState('');
  const [city, setCity] = React.useState<string[]>([]);
  const [saved, setSaved] = React.useState(false);
  const [page, setPage] = React.useState(1);

  const cityOptions = CITY_KEYS.map((key) => ({
    value: key,
    content: t(`form.city.${key}` as TranslationKey),
  }));

  const rows: Row[] = ITEM_KEYS.map((key) => ({
    id: key,
    item: t(`table.item.${key}` as TranslationKey),
    count: ITEM_COUNTS[key],
  }));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: TableColumnConfig<Row>[] = [
    {id: 'item', name: t('table.item')},
    {id: 'count', name: t('table.count'), align: 'end'},
  ];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <Flex direction="column" gap={6} style={{padding: 24, maxWidth: 720, margin: '0 auto'}}>
      <Flex as="header" justifyContent="space-between" alignItems="center" gap={4}>
        <Text variant="header-2" as="h1">
          {t('app.title')}
        </Text>
        <LanguageSwitcher />
      </Flex>

      <Text color="secondary">{t('app.description')}</Text>

      <Alert
        theme="info"
        title={t('greeting.title', {name: name.trim() || (lang === 'ru' ? 'гость' : 'guest')})}
        message={t('greeting.message')}
      />

      <Card view="outlined" style={{padding: 20}}>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap={4}>
            <Text variant="subheader-2">{t('form.title')}</Text>

            <Flex direction="column" gap={1}>
              <Text as="label" htmlFor="name-input">{t('form.name')}</Text>
              <TextInput
                id="name-input"
                value={name}
                onUpdate={(value) => {
                  setName(value);
                  setSaved(false);
                }}
                placeholder={t('form.name.placeholder')}
                hasClear
              />
            </Flex>

            <Flex direction="column" gap={1}>
              <Text as="label" id="city-label">{t('form.city')}</Text>
              <Select
                aria-labelledby="city-label"
                value={city}
                onUpdate={(value) => {
                  setCity(value);
                  setSaved(false);
                }}
                options={cityOptions}
                placeholder={t('form.city.placeholder')}
                filterable
                hasClear
                width="max"
              />
            </Flex>

            <Flex gap={3} alignItems="center">
              <Button type="submit" view="action">
                {t('form.submit')}
              </Button>
              {saved && <Text color="positive">{t('form.saved')}</Text>}
            </Flex>
          </Flex>
        </form>
      </Card>

      <Card view="outlined" style={{padding: 20}}>
        <Flex direction="column" gap={4}>
          <Text variant="subheader-2">{t('table.title')}</Text>
          <Table data={pageRows} columns={columns} getRowId={(row) => row.id} />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={rows.length}
            compact={false}
            showInput
            onUpdate={(nextPage) => setPage(nextPage)}
          />
        </Flex>
      </Card>

      <Flex gap={2} alignItems="center">
        <Text color="secondary">{t('language.current', {lang: t(`language.${lang}`)})}</Text>
        <ClipboardButton text={lang} size="s" aria-label={t('clipboard.label')} />
      </Flex>
    </Flex>
  );
}

export function App() {
  return (
    <I18nProvider>
      <Page />
    </I18nProvider>
  );
}
