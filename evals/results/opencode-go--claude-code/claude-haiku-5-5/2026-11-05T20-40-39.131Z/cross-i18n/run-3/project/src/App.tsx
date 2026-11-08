import * as React from 'react';
import {
  Button,
  Card,
  Checkbox,
  Pagination,
  SegmentedRadioGroup,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

import { useI18n } from './i18n/I18nProvider';
import { LANGUAGES, LANGUAGE_NAMES } from './i18n/translations';

const LANGUAGE_OPTIONS = LANGUAGES.map((code) => ({ value: code, content: LANGUAGE_NAMES[code] }));

export function App() {
  const { t, language, setLanguage } = useI18n();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [newsletter, setNewsletter] = React.useState(false);
  const [nameInvalid, setNameInvalid] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    document.title = t('app.title');
  }, [t]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const valid = name.trim().length > 0;
    setNameInvalid(!valid);
    setSaved(valid);
  };

  const handleCancel = () => {
    setName('');
    setEmail('');
    setNewsletter(false);
    setNameInvalid(false);
    setSaved(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Text as="h1" variant="header-2">
          {t('app.title')}
        </Text>
        <SegmentedRadioGroup
          aria-label={t('language.label')}
          value={language}
          onUpdate={setLanguage}
          options={LANGUAGE_OPTIONS}
        />
      </header>

      <Text color="secondary">{t('app.description')}</Text>

      <Card type="container" view="outlined" size="l">
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <TextInput
            label={t('form.name')}
            placeholder={t('form.namePlaceholder')}
            value={name}
            onUpdate={(value) => {
              setName(value);
              setNameInvalid(false);
            }}
            validationState={nameInvalid ? 'invalid' : undefined}
            errorMessage={nameInvalid ? t('form.nameRequired') : undefined}
          />
          <TextInput
            type="email"
            label={t('form.email')}
            value={email}
            onUpdate={setEmail}
            note={t('form.emailNote')}
          />
          <Checkbox checked={newsletter} onUpdate={setNewsletter}>
            {t('form.newsletter')}
          </Checkbox>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            {saved && <Text color="positive">{t('form.saved')}</Text>}
            <Button view="flat" onClick={handleCancel}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" view="action">
              {t('form.save')}
            </Button>
          </div>
        </form>
      </Card>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Text as="h2" variant="subheader-2">
          {t('pagination.title')}
        </Text>
        <Text color="secondary">{t('pagination.description')}</Text>
        <Pagination
          page={page}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          total={120}
          showInput
          onUpdate={(nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
        />
      </section>
    </div>
  );
}
