import * as React from 'react';
import {
  Button,
  Card,
  Flex,
  Pagination,
  Switch,
  Text,
  TextInput,
  Toaster,
  ToasterComponent,
  ToasterProvider,
  useToaster,
} from '@gravity-ui/uikit';

import { LocaleProvider, useLocale } from './i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

const toaster = new Toaster();

function Header() {
  const { t } = useLocale();
  return (
    <Flex as="header" justifyContent="space-between" alignItems="center" gap={4} wrap>
      <div>
        <Text variant="header-2" as="h1" style={{ margin: 0 }}>
          {t('app.title')}
        </Text>
        <Text variant="body-2" color="secondary" as="p" style={{ margin: 0 }}>
          {t('app.subtitle')}
        </Text>
      </div>
      <Flex alignItems="center" gap={2}>
        <Text variant="body-2" color="secondary">
          {t('lang.label')}
        </Text>
        <LanguageSwitcher />
      </Flex>
    </Flex>
  );
}

function AboutCard() {
  const { t, lang } = useLocale();
  return (
    <Card view="outlined" style={{ padding: 20 }}>
      <Flex direction="column" gap={2}>
        <Text variant="subheader-2">{t('card.about.title')}</Text>
        <Text variant="body-1">{t('card.about.body')}</Text>
        <Text variant="body-1" color="secondary">
          {t('lang.current', { lang: t(`lang.${lang}`) })}
        </Text>
      </Flex>
    </Card>
  );
}

function FormCard() {
  const { t } = useLocale();
  const { add } = useToaster();
  const [name, setName] = React.useState('');
  const [notifications, setNotifications] = React.useState(true);

  return (
    <Card view="outlined" style={{ padding: 20 }}>
      <Flex direction="column" gap={3}>
        <Text variant="subheader-2">{t('card.form.title')}</Text>
        <TextInput
          label={t('card.form.name')}
          placeholder={t('card.form.name.placeholder')}
          value={name}
          onUpdate={setName}
          hasClear
        />
        <Switch checked={notifications} onUpdate={setNotifications}>
          {t('card.form.notifications')}
        </Switch>
        <div>
          <Button
            view="action"
            onClick={() =>
              add({ name: 'saved', title: t('card.form.saved'), theme: 'success', autoHiding: 3000 })
            }
          >
            {t('card.form.submit')}
          </Button>
        </div>
      </Flex>
    </Card>
  );
}

function PaginationCard() {
  const { t } = useLocale();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  return (
    <Card view="outlined" style={{ padding: 20 }}>
      <Flex direction="column" gap={3}>
        <Text variant="subheader-2">{t('card.pagination.title')}</Text>
        <Text variant="body-1" color="secondary">
          {t('card.pagination.hint')}
        </Text>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={200}
          pageSizeOptions={[10, 20, 50]}
          showInput
          onUpdate={(nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
        />
      </Flex>
    </Card>
  );
}

function Page() {
  return (
    <Flex direction="column" gap={5} style={{ padding: 24, maxWidth: 880, margin: '0 auto' }}>
      <Header />
      <AboutCard />
      <FormCard />
      <PaginationCard />
    </Flex>
  );
}

export function App() {
  return (
    <LocaleProvider>
      <ToasterProvider toaster={toaster}>
        <Page />
        <ToasterComponent />
      </ToasterProvider>
    </LocaleProvider>
  );
}
