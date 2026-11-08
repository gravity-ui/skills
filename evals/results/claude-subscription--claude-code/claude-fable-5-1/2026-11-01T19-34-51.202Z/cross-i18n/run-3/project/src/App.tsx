import React from 'react';
import { Button, Card, Flex, Label, Pagination, Select, Table, Text } from '@gravity-ui/uikit';

import { LanguageSwitcher } from './LanguageSwitcher';
import { LocaleProvider, type MessageKey, useI18n } from './i18n';

export function App() {
  return (
    <LocaleProvider>
      <Dashboard />
    </LocaleProvider>
  );
}

type Member = { id: number; name: string; role: MessageKey; status: MessageKey };

const MEMBERS: Member[] = [
  { id: 1, name: 'Anna Petrova', role: 'role.engineer', status: 'status.active' },
  { id: 2, name: 'John Smith', role: 'role.designer', status: 'status.vacation' },
  { id: 3, name: 'Ivan Ivanov', role: 'role.manager', status: 'status.offline' },
];

const FRUITS: MessageKey[] = ['fruit.apple', 'fruit.pear', 'fruit.cherry', 'fruit.plum', 'fruit.grape'];

const STATUS_THEME: Record<string, 'success' | 'warning' | 'unknown'> = {
  'status.active': 'success',
  'status.vacation': 'warning',
  'status.offline': 'unknown',
};

function Dashboard() {
  const { t, lang } = useI18n();
  const [count, setCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [fruit, setFruit] = React.useState<string[]>([]);

  const columns = React.useMemo(
    () => [
      { id: 'name', name: t('table.name') },
      { id: 'role', name: t('table.role'), template: (row: Member) => t(row.role) },
      {
        id: 'status',
        name: t('table.status'),
        template: (row: Member) => <Label theme={STATUS_THEME[row.status]}>{t(row.status)}</Label>,
      },
    ],
    [t],
  );

  return (
    <Flex direction="column" gap={6} style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <Flex as="header" justifyContent="space-between" alignItems="center" gap={4} wrap>
        <div>
          <Text as="h1" variant="header-2">
            {t('app.title')}
          </Text>
          <Text as="p" variant="body-1" color="secondary">
            {t('app.subtitle')}
          </Text>
        </div>
        <Flex direction="column" alignItems="flex-end" gap={1}>
          <Text variant="caption-2" color="secondary">
            {t('language.label')}
          </Text>
          <LanguageSwitcher />
        </Flex>
      </Flex>

      <Card view="filled" style={{ padding: 16 }}>
        <Flex direction="column" gap={2}>
          <Text variant="subheader-2">{t('greeting.title')}</Text>
          <Text>{t('greeting.body')}</Text>
          <Text color="secondary">{t('language.current', { lang: t(`language.${lang}`) })}</Text>
        </Flex>
      </Card>

      <Card view="outlined" style={{ padding: 16 }}>
        <Flex alignItems="center" gap={3} wrap>
          <Text>{t('counter.label', { count })}</Text>
          <Button view="action" onClick={() => setCount((c) => c + 1)}>
            {t('counter.increment')}
          </Button>
          <Button view="flat" onClick={() => setCount(0)} disabled={count === 0}>
            {t('counter.reset')}
          </Button>
        </Flex>
      </Card>

      <Flex direction="column" gap={2}>
        <Text variant="subheader-2">{t('table.title')}</Text>
        <Table data={MEMBERS} columns={columns} getRowId="id" />
      </Flex>

      <Flex direction="column" gap={2}>
        <Text variant="subheader-2">{t('select.label')}</Text>
        <Select
          width={260}
          value={fruit}
          onUpdate={setFruit}
          placeholder={t('select.placeholder')}
          filterable
          filterPlaceholder={t('select.filterPlaceholder')}
          hasClear
          renderEmptyOptions={() => (
            <Text color="secondary" style={{ padding: '8px 12px', display: 'block' }}>
              {t('select.empty')}
            </Text>
          )}
          options={FRUITS.map((key) => ({ value: key, content: t(key) }))}
        />
      </Flex>

      <Flex direction="column" gap={2}>
        <Text variant="subheader-2">{t('pagination.title')}</Text>
        <Text color="secondary">{t('pagination.hint')}</Text>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={137}
          compact={false}
          showInput
          pageSizeOptions={[10, 20, 50]}
          onUpdate={(nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
        />
      </Flex>

      <Text as="footer" variant="caption-2" color="hint">
        {t('footer.saved')}
      </Text>
    </Flex>
  );
}
