// Implement the requested feature here (and may add sibling files).
import { useMemo, useRef, useState } from 'react';
import { Avatar, Button, Checkbox, Flex, Select, Switch, Text, TextInput } from '@gravity-ui/uikit';

type Language = 'ru' | 'en';
type TimeZone = 'utc' | 'europe/moscow' | 'europe/london' | 'america/new-york';

type EmailNotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

type ProfileSettings = {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: Language | null;
  timeZone: TimeZone | null;
  twoFactorEnabled: boolean;
  emailNotifications: Record<EmailNotificationKey, boolean>;
};

const initialProfileSettings: ProfileSettings = {
  name: 'Анна Иванова',
  email: 'anna@example.com',
  avatarUrl: null,
  language: 'ru',
  timeZone: 'europe/moscow',
  twoFactorEnabled: false,
  emailNotifications: {
    productNews: true,
    systemAlerts: false,
    weeklyDigest: true,
  },
};

const languages: Array<{ value: Language; text: string }> = [
  { value: 'ru', text: 'Русский' },
  { value: 'en', text: 'English' },
];

const timeZones: Array<{ value: TimeZone; text: string }> = [
  { value: 'utc', text: 'UTC' },
  { value: 'europe/moscow', text: 'Europe/Moscow' },
  { value: 'europe/london', text: 'Europe/London' },
  { value: 'america/new-york', text: 'America/New York' },
];

const emailNotifications: Array<{ key: EmailNotificationKey; label: string }> = [
  { key: 'productNews', label: 'Новости продукта' },
  { key: 'systemAlerts', label: 'Системные алерты' },
  { key: 'weeklyDigest', label: 'Дайджест за неделю' },
];

export function App() {
  const [settings, setSettings] = useState(initialProfileSettings);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarText = useMemo(() => settings.name.trim().slice(0, 1).toUpperCase(), [settings.name]);

  const updateNotifications = (key: EmailNotificationKey, checked: boolean) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      emailNotifications: { ...currentSettings.emailNotifications, [key]: checked },
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setSettings((currentSettings) => ({ ...currentSettings, avatarUrl: URL.createObjectURL(file) }));
  };

  const resetErrors = () => setErrors({});

  const handleSave = () => {
    const nextErrors: typeof errors = {};
    if (!settings.name.trim()) {
      nextErrors.name = 'Укажите имя';
    }
    if (!settings.email.trim()) {
      nextErrors.email = 'Укажите email';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    resetErrors();
    console.log('Profile settings saved', settings);
  };

  const handleCancel = () => {
    setSettings(initialProfileSettings);
    resetErrors();
  };

  return (
    <Flex direction="column" gap="4" style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <Text variant="header-2">Настройки профиля</Text>

      <Flex direction="column" gap="4">
        <TextInput
          label="Имя"
          value={settings.name}
          onChange={(event) => setSettings((current) => ({ ...current, name: event.target.value }))}
          error={errors.name}
          placeholder="Введите имя"
        />

        <TextInput
          label="Email"
          type="email"
          value={settings.email}
          onChange={(event) => setSettings((current) => ({ ...current, email: event.target.value }))}
          error={errors.email}
          placeholder="user@example.com"
        />

        <Flex direction="column" gap="2">
          <Text variant="body-1">Аватар</Text>
          <Flex alignItems="center" gap="3">
            {settings.avatarUrl ? (
              <Avatar size="l" imgUrl={settings.avatarUrl} alt="Аватар профиля" />
            ) : (
              <Avatar size="l" text={avatarText || '?'} />
            )}
            <input hidden ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} />
            <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
              Загрузить файл
            </Button>
          </Flex>
        </Flex>

        <Select
          label="Язык интерфейса"
          value={settings.language ? [settings.language] : []}
          onUpdate={([value]) => setSettings((current) => ({ ...current, language: value as Language }))}
          options={languages}
          placeholder="Выберите язык"
          width="max"
        />

        <Select
          label="Часовой пояс"
          value={settings.timeZone ? [settings.timeZone] : []}
          onUpdate={([value]) => setSettings((current) => ({ ...current, timeZone: value as TimeZone }))}
          options={timeZones}
          placeholder="Выберите часовой пояс"
          width="max"
        />

        <Switch
          checked={settings.twoFactorEnabled}
          onChange={(event) => setSettings((current) => ({ ...current, twoFactorEnabled: event.target.checked }))}
        >
          Двухфакторная авторизация
        </Switch>

        <Flex direction="column" gap="2">
          <Text variant="body-1">Email-уведомления</Text>
          {emailNotifications.map((notification) => (
            <Checkbox
              key={notification.key}
              checked={settings.emailNotifications[notification.key]}
              onChange={(event) => updateNotifications(notification.key, event.target.checked)}
            >
              {notification.label}
            </Checkbox>
          ))}
        </Flex>
      </Flex>

      <Flex gap="2" justifyContent="flex-end">
        <Button view="normal" onClick={handleCancel}>
          Отмена
        </Button>
        <Button view="action" onClick={handleSave}>
          Сохранить
        </Button>
      </Flex>
    </Flex>
  );
}
