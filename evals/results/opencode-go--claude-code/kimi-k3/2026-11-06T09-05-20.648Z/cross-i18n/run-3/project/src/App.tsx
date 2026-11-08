import {useState} from 'react';
import {Button, Card, Progress, Text} from '@gravity-ui/uikit';
import {LanguageSwitcher} from './components/LanguageSwitcher';
import {useLanguage} from './i18n/LanguageContext';

const USER_NAME = 'Alex';

export function App() {
  const {t} = useLanguage();
  const [readAll, setReadAll] = useState(false);

  const done = 18;
  const total = 24;

  return (
    <div style={{maxWidth: 720, margin: '0 auto', padding: 24}}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <div>
          <Text variant="header-1">{t('appTitle')}</Text>
          <div>
            <Text variant="body-2" color="secondary">
              {t('appSubtitle')}
            </Text>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      <Card style={{padding: 20, marginBottom: 16}}>
        <Text variant="subheader-2">{t('greeting', {name: USER_NAME})}</Text>
        <div style={{marginTop: 4}}>
          <Text variant="body-2" color="secondary">
            {t('welcomeBack')}
          </Text>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            marginTop: 16,
          }}
        >
          <Stat value={8} label={t('statsActiveProjects')} />
          <Stat value={23} label={t('statsOpenTasks')} />
          <Stat value={15} label={t('statsDoneThisWeek')} />
        </div>
      </Card>

      <Card style={{padding: 20, marginBottom: 16}}>
        <Text variant="subheader-2">{t('progressTitle')}</Text>
        <div style={{margin: '12px 0 8px'}}>
          <Progress value={Math.round((done / total) * 100)} />
        </div>
        <Text variant="body-2" color="secondary">
          {t('progressValue', {done, total})}
        </Text>
      </Card>

      <Card style={{padding: 20, marginBottom: 16}}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Text variant="subheader-2">{t('notificationsTitle')}</Text>
          <Button view="flat" size="s" onClick={() => setReadAll(true)} disabled={readAll}>
            {t('markAllRead')}
          </Button>
        </div>
        <div style={{marginTop: 8}}>
          {readAll ? (
            <Text variant="body-2" color="secondary">
              {t('notificationsEmpty')}
            </Text>
          ) : (
            <ul style={{margin: 0, paddingLeft: 20}}>
              <li>
                <Text variant="body-2">{t('notificationReview', {name: 'Maria'})}</Text>
              </li>
              <li>
                <Text variant="body-2">{t('notificationDeploy')}</Text>
              </li>
            </ul>
          )}
        </div>
      </Card>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Button view="action">{t('createTask')}</Button>
        <Text variant="caption-2" color="hint">
          {t('footerNote')}
        </Text>
      </div>
    </div>
  );
}

function Stat({value, label}: {value: number; label: string}) {
  return (
    <div>
      <Text variant="display-2">{value}</Text>
      <div>
        <Text variant="caption-2" color="secondary">
          {label}
        </Text>
      </div>
    </div>
  );
}
