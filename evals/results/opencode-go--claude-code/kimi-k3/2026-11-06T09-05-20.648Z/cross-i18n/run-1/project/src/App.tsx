import React from 'react';

import {
  Button,
  Card,
  DefinitionList,
  Label,
  SegmentedRadioGroup,
  Switch,
  Text,
  TextArea,
  TextInput,
} from '@gravity-ui/uikit';

import {Language, LanguageProvider, useLanguage} from './i18n';

function LanguageSwitcher() {
  const {language, setLanguage, t} = useLanguage();

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      <Text variant="body-2" color="secondary">
        {t('language')}
      </Text>
      <SegmentedRadioGroup
        size="m"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
      >
        <SegmentedRadioGroup.Option value="en">English</SegmentedRadioGroup.Option>
        <SegmentedRadioGroup.Option value="ru">Русский</SegmentedRadioGroup.Option>
      </SegmentedRadioGroup>
    </div>
  );
}

function ProfileSettings() {
  const {t} = useLanguage();
  const [name, setName] = React.useState('');
  const [about, setAbout] = React.useState('');
  const [notifications, setNotifications] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{maxWidth: 640, margin: '0 auto', padding: 24, display: 'grid', gap: 24}}>
      <header style={{display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <Text variant="header-1" as="div">
            {t('appTitle')}
          </Text>
          <Text variant="body-2" color="secondary" as="div">
            {t('appSubtitle')}
          </Text>
        </div>
        <LanguageSwitcher />
      </header>

      <Card view="raised" style={{padding: 24, display: 'grid', gap: 16}}>
        <Text variant="subheader-2" as="div">
          {t('greeting', {name: name.trim() || t('defaultName')})}
        </Text>

        <label style={{display: 'grid', gap: 4}}>
          <Text variant="body-2">{t('name')}</Text>
          <TextInput
            value={name}
            onUpdate={setName}
            placeholder={t('namePlaceholder')}
          />
        </label>

        <label style={{display: 'grid', gap: 4}}>
          <Text variant="body-2">{t('about')}</Text>
          <TextArea
            value={about}
            onUpdate={setAbout}
            placeholder={t('aboutPlaceholder')}
            minRows={3}
          />
        </label>

        <Switch checked={notifications} onUpdate={setNotifications}>
          {t('notifications')}
        </Switch>

        <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
          <Button view="action" onClick={handleSave}>
            {t('save')}
          </Button>
          <Button view="flat">{t('cancel')}</Button>
          {saved && <Label theme="success">{t('saved')}</Label>}
        </div>
      </Card>

      <Card view="raised" style={{padding: 24}}>
        <Text variant="subheader-2" as="div" qa="account-info-title">
          {t('accountInfo')}
        </Text>
        <DefinitionList>
          <DefinitionList.Item name={t('email')}>user@example.com</DefinitionList.Item>
          <DefinitionList.Item name={t('role')}>{t('roleAdmin')}</DefinitionList.Item>
          <DefinitionList.Item name={t('plan')}>{t('planFree')}</DefinitionList.Item>
          <DefinitionList.Item name={t('status')}>
            <Label theme="info">{t('statusActive')}</Label>
          </DefinitionList.Item>
        </DefinitionList>
      </Card>
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <ProfileSettings />
    </LanguageProvider>
  );
}
