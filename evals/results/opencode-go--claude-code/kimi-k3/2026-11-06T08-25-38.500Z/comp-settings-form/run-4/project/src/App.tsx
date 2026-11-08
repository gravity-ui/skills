import * as React from 'react';

import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
  useFileInput,
} from '@gravity-ui/uikit';

const LANGUAGES = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'},
  {value: 'fr', content: 'Français'},
  {value: 'es', content: 'Español'},
  {value: 'zh', content: '中文'},
];

const TIMEZONES = [
  'UTC',
  'Europe/Kaliningrad',
  'Europe/Moscow',
  'Europe/Samara',
  'Asia/Yekaterinburg',
  'Asia/Omsk',
  'Asia/Krasnoyarsk',
  'Asia/Irkutsk',
  'Asia/Yakutsk',
  'Asia/Vladivostok',
  'Asia/Kamchatka',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Almaty',
  'Asia/Tbilisi',
  'Asia/Yerevan',
  'Asia/Tashkent',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
].map((tz) => ({value: tz, content: tz.replace(/_/g, ' ')}));

interface Notifications {
  news: boolean;
  alerts: boolean;
  digest: boolean;
}

interface ProfileSettings {
  name: string;
  email: string;
  avatarUrl: string | undefined;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: Notifications;
}

const INITIAL_SETTINGS: ProfileSettings = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  avatarUrl: undefined,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifications: {
    news: true,
    alerts: true,
    digest: false,
  },
};

function SectionTitle({children}: {children: React.ReactNode}) {
  return (
    <Text variant="subheader-2" color="secondary">
      {children}
    </Text>
  );
}

function FieldLabel({children, htmlFor}: {children: React.ReactNode; htmlFor?: string}) {
  return (
    <label htmlFor={htmlFor}>
      <Text variant="body-2" color="secondary">
        {children}
      </Text>
    </label>
  );
}

export function App() {
  const [settings, setSettings] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
  const [savedMessage, setSavedMessage] = React.useState<string | null>(null);

  const patch = React.useCallback((partial: Partial<ProfileSettings>) => {
    setSavedMessage(null);
    setSettings((prev) => ({...prev, ...partial}));
  }, []);

  const handleAvatarUpload = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (file) {
        patch({avatarUrl: URL.createObjectURL(file)});
      }
    },
    [patch],
  );

  const {controlProps: avatarInputProps, triggerProps: avatarTriggerProps} = useFileInput({
    onUpdate: handleAvatarUpload,
  });

  const handleSave = () => {
    // Здесь был бы запрос к API
    console.log('Сохранение настроек профиля:', settings);
    setSavedMessage('Настройки сохранены');
  };

  const handleCancel = () => {
    setSavedMessage(null);
    setSettings(INITIAL_SETTINGS);
  };

  const notificationItems: Array<{key: keyof Notifications; label: string; hint: string}> = [
    {key: 'news', label: 'Новости продукта', hint: 'Релизы, новые функции и обновления'},
    {key: 'alerts', label: 'Системные алерты', hint: 'Важные события и инциденты сервиса'},
    {key: 'digest', label: 'Дайджест за неделю', hint: 'Еженедельная сводка активности'},
  ];

  return (
    <Flex
      justifyContent="center"
      style={{minHeight: '100vh', padding: '48px 16px', background: 'var(--g-color-base-background)'}}
    >
      <Card
        view="raised"
        style={{width: '100%', maxWidth: 720, padding: 32, height: 'fit-content'}}
      >
        <Flex direction="column" gap={6}>
          <Text variant="header-2">Настройки профиля</Text>

          {/* Профиль */}
          <Flex direction="column" gap={4}>
            <SectionTitle>Профиль</SectionTitle>
            <Flex gap={5} alignItems="center" wrap="wrap">
              <Avatar size="xl" imgUrl={settings.avatarUrl} text={settings.name} theme="brand" />
              <Flex direction="column" gap={2}>
                <input {...avatarInputProps} accept="image/*" style={{display: 'none'}} />
                <Flex gap={2}>
                  <Button {...avatarTriggerProps} view="outlined">
                    Загрузить фото
                  </Button>
                  {settings.avatarUrl && (
                    <Button view="flat" onClick={() => patch({avatarUrl: undefined})}>
                      Удалить
                    </Button>
                  )}
                </Flex>
                <Text variant="caption-2" color="hint">
                  PNG или JPG, до 5 МБ
                </Text>
              </Flex>
            </Flex>

            <Flex direction="column" gap={1}>
              <FieldLabel htmlFor="profile-name">Имя</FieldLabel>
              <TextInput
                id="profile-name"
                size="l"
                value={settings.name}
                placeholder="Ваше имя"
                onUpdate={(name) => patch({name})}
              />
            </Flex>

            <Flex direction="column" gap={1}>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <TextInput
                id="profile-email"
                size="l"
                type="email"
                value={settings.email}
                placeholder="you@example.com"
                onUpdate={(email) => patch({email})}
              />
            </Flex>
          </Flex>

          <Divider />

          {/* Региональные настройки */}
          <Flex direction="column" gap={4}>
            <SectionTitle>Региональные настройки</SectionTitle>
            <Flex gap={4} wrap="wrap">
              <Flex direction="column" gap={1} style={{flex: '1 1 240px'}}>
                <FieldLabel htmlFor="profile-language">Язык интерфейса</FieldLabel>
                <Select
                  id="profile-language"
                  size="l"
                  width="max"
                  options={LANGUAGES}
                  value={[settings.language]}
                  onUpdate={([language]) => patch({language})}
                />
              </Flex>
              <Flex direction="column" gap={1} style={{flex: '1 1 240px'}}>
                <FieldLabel htmlFor="profile-timezone">Часовой пояс</FieldLabel>
                <Select
                  id="profile-timezone"
                  size="l"
                  width="max"
                  filterable
                  options={TIMEZONES}
                  value={[settings.timezone]}
                  onUpdate={([timezone]) => patch({timezone})}
                />
              </Flex>
            </Flex>
          </Flex>

          <Divider />

          {/* Безопасность */}
          <Flex direction="column" gap={3}>
            <SectionTitle>Безопасность</SectionTitle>
            <Flex gap={3} alignItems="center" justifyContent="space-between">
              <Flex direction="column" gap={1}>
                <Text variant="body-2">Двухфакторная аутентификация</Text>
                <Text variant="caption-2" color="hint">
                  Дополнительный код подтверждения при входе в аккаунт
                </Text>
              </Flex>
              <Switch
                size="l"
                checked={settings.twoFactor}
                onUpdate={(twoFactor) => patch({twoFactor})}
                aria-label="Двухфакторная аутентификация"
              />
            </Flex>
          </Flex>

          <Divider />

          {/* Email-уведомления */}
          <Flex direction="column" gap={3}>
            <SectionTitle>Email-уведомления</SectionTitle>
            {notificationItems.map(({key, label, hint}) => (
              <Flex key={key} gap={3} alignItems="center" justifyContent="space-between">
                <Flex direction="column" gap={1}>
                  <Text variant="body-2">{label}</Text>
                  <Text variant="caption-2" color="hint">
                    {hint}
                  </Text>
                </Flex>
                <Checkbox
                  size="l"
                  checked={settings.notifications[key]}
                  onUpdate={(checked) =>
                    patch({notifications: {...settings.notifications, [key]: checked}})
                  }
                  aria-label={label}
                />
              </Flex>
            ))}
          </Flex>

          <Divider />

          {/* Действия */}
          <Flex direction="column" gap={3}>
            {savedMessage && <Alert theme="success" message={savedMessage} onClose={() => setSavedMessage(null)} />}
            <Flex gap={3} justifyContent="flex-end">
              <Button view="outlined" size="l" onClick={handleCancel}>
                Отмена
              </Button>
              <Button view="action" size="l" onClick={handleSave}>
                Сохранить
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
