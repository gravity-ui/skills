import * as React from 'react';
import {
  Alert,
  Button,
  Card,
  ClipboardButton,
  Container,
  Flex,
  Label,
  Pagination,
  Text,
} from '@gravity-ui/uikit';

import {LanguageSwitcher} from './components/LanguageSwitcher';
import {LANG_LABELS} from './i18n';
import {LangProvider, useI18n} from './i18n/LangProvider';

const TOTAL_ITEMS = 57;

function AppContent() {
  const {lang, t} = useI18n();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [alertVisible, setAlertVisible] = React.useState(true);

  const itemsOnPage = Math.max(0, Math.min(pageSize, TOTAL_ITEMS - (page - 1) * pageSize));
  const today = new Intl.DateTimeFormat(lang, {dateStyle: 'long'}).format(new Date());

  return (
    <Container maxWidth="m" style={{paddingBlock: 'var(--g-spacing-6)'}}>
      <Flex direction="column" gap={6}>
        <Flex as="header" alignItems="center" justifyContent="space-between" gap={4} wrap>
          <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
            <Text variant="header-1">{t('title')}</Text>
            <Text variant="body-1" color="secondary">
              {t('subtitle')}
            </Text>
          </Flex>
          <div style={{flexShrink: 0}}>
            <LanguageSwitcher />
          </div>
        </Flex>

        {alertVisible && (
          <Alert
            theme="success"
            title={t('alert-title')}
            message={t('alert-message')}
            onClose={() => setAlertVisible(false)}
          />
        )}

        <Card type="container" view="outlined" spacing={{p: 5}}>
          <Flex direction="column" gap={4}>
            <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
              <Text variant="subheader-2">{t('card-title')}</Text>
              <Label theme="info" size="s">
                {t('current-language', {lang: LANG_LABELS[lang]})}
              </Label>
            </Flex>
            <Text variant="body-2">{t('card-text')}</Text>
            <Text variant="body-1" color="secondary">
              {t('today', {date: today})}
            </Text>

            <Flex direction="column" gap={2}>
              <Text variant="body-1" color="secondary">
                {t('items-label')}
              </Text>
              <Text variant="body-2">{t('items-count', {count: itemsOnPage})}</Text>
              <Pagination
                page={page}
                pageSize={pageSize}
                total={TOTAL_ITEMS}
                pageSizeOptions={[5, 10, 20]}
                compact={false}
                showInput
                onUpdate={(nextPage, nextPageSize) => {
                  setPage(nextPage);
                  setPageSize(nextPageSize);
                }}
              />
            </Flex>

            <Flex alignItems="center" gap={2} wrap>
              <Button view="action">{t('save')}</Button>
              <Button view="flat">{t('cancel')}</Button>
              <ClipboardButton text={window.location.href} view="outlined" size="m">
                {t('copy-label')}
              </ClipboardButton>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}

export function App() {
  return (
    <LangProvider>
      <AppContent />
    </LangProvider>
  );
}
