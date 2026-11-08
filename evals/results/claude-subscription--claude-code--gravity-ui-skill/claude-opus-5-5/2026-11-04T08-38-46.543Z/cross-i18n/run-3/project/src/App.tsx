import * as React from 'react';
import { Box, Card, Flex, Pagination, Text } from '@gravity-ui/uikit';

import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from './i18n';

const TOTAL_TASKS = 42;
const PAGE_SIZE = 10;

export function App() {
  const { t } = useTranslation('app');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE);

  return (
    <Box spacing={{ p: 6 }} style={{ maxWidth: 960, marginInline: 'auto' }}>
      <Flex direction="column" gap={6}>
        <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
          <Flex direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
            <Text variant="header-1" as="h1">
              {t('title')}
            </Text>
            <Text color="secondary">{t('subtitle')}</Text>
          </Flex>
          <div style={{ flexShrink: 0 }}>
            <LanguageSwitcher />
          </div>
        </Flex>

        <Card view="outlined" spacing={{ p: 5 }}>
          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">{t('card_title')}</Text>
            <Text>{t('card_text')}</Text>
          </Flex>
        </Card>

        <Flex direction="column" gap={3}>
          <Flex alignItems="baseline" gap={2} wrap>
            <Text variant="subheader-2">{t('pagination_title')}</Text>
            <Text color="secondary">{t('items_count', { count: TOTAL_TASKS })}</Text>
          </Flex>
          {/* Pagination's own labels ("Previous", "Next", "of"…) come from uikit keysets. */}
          <Pagination
            page={page}
            pageSize={pageSize}
            total={TOTAL_TASKS}
            pageSizeOptions={[5, 10, 20]}
            compact={false}
            showInput
            onUpdate={(nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            }}
          />
        </Flex>
      </Flex>
    </Box>
  );
}
