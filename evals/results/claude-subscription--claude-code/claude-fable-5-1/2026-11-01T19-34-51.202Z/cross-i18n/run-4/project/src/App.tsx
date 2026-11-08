import React from 'react';
import {
  Button,
  Card,
  Flex,
  Pagination,
  Select,
  Text,
  TextInput,
  Toaster,
  ToasterComponent,
  ToasterProvider,
} from '@gravity-ui/uikit';

import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LanguageProvider, useTranslation } from './i18n';

const toaster = new Toaster();

function DemoForm() {
  const { t } = useTranslation();
  const [name, setName] = React.useState('');
  const [fruit, setFruit] = React.useState<string[]>([]);

  const fruitOptions = [
    { value: 'apple', content: t('form.fruit.apple') },
    { value: 'banana', content: t('form.fruit.banana') },
    { value: 'cherry', content: t('form.fruit.cherry') },
  ];

  return (
    <Flex direction="column" gap={3}>
      <Flex direction="column" gap={1}>
        <Text variant="subheader-1" as="label" htmlFor="demo-name">
          {t('form.name.label')}
        </Text>
        <TextInput
          id="demo-name"
          value={name}
          onUpdate={setName}
          placeholder={t('form.name.placeholder')}
          hasClear
        />
      </Flex>
      <Flex direction="column" gap={1}>
        <Text variant="subheader-1" as="span" id="demo-fruit-label">
          {t('form.fruit.label')}
        </Text>
        <Select
          value={fruit}
          onUpdate={setFruit}
          options={fruitOptions}
          placeholder={t('form.fruit.placeholder')}
          hasClear
          width="max"
          aria-labelledby="demo-fruit-label"
        />
      </Flex>
      <Flex gap={2}>
        <Button
          view="action"
          onClick={() => toaster.add({ name: 'saved', title: t('toast.saved'), theme: 'success' })}
        >
          {t('form.submit')}
        </Button>
        <Button
          view="outlined"
          onClick={() => {
            setName('');
            setFruit([]);
          }}
        >
          {t('form.reset')}
        </Button>
      </Flex>
    </Flex>
  );
}

function Content() {
  const { t, language } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  return (
    <Flex direction="column" gap={5} style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <Flex direction="column" gap={2}>
        <Text variant="display-1" as="h1">
          {t('app.title')}
        </Text>
        <Text variant="body-2" color="secondary">
          {t('app.description')}
        </Text>
      </Flex>

      <Card view="filled" style={{ padding: 20 }}>
        <Flex direction="column" gap={2}>
          <LanguageSwitcher />
          <Text variant="caption-2" color="secondary" qa="current-language">
            {t('language.current', { language: t(`language.${language}`) })}
          </Text>
        </Flex>
      </Card>

      <Card view="outlined" style={{ padding: 20 }}>
        <Flex direction="column" gap={3}>
          <Flex direction="column" gap={1}>
            <Text variant="header-1" as="h2">
              {t('greeting.title')}
            </Text>
            <Text variant="body-1">{t('greeting.text')}</Text>
          </Flex>
          <DemoForm />
        </Flex>
      </Card>

      <Flex direction="column" gap={2}>
        <Text variant="body-1" color="secondary">
          {t('pagination.caption')}
        </Text>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={120}
          showInput
          showPages
          pageSizeOptions={[10, 20, 50]}
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
      <ToasterProvider toaster={toaster}>
        <Content />
        <ToasterComponent />
      </ToasterProvider>
    </LanguageProvider>
  );
}
