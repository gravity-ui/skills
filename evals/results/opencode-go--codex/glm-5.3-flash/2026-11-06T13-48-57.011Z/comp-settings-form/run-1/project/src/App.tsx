import { useMemo, useRef, useState } from 'react';
import {
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
} from '@gravity-ui/uikit';

type ProfileSettings = {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: {
    productNews: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
  };
};

const languages = [
  { value: 'ru', text: 'Русский' },
  { value: 'en', text: 'English' },
  { value: 'de', text: 'Deutsch' },
  { value: 'fr', text: 'Français' },
];

const timezones = [
  { value: 'UTC', text: 'UTC' },
  { value: 'Europe/Moscow', text: 'Europe/Moscow (UTC+03:00)' },
  { value: 'Europe/Berlin', text: 'Europe/Berlin (UTC+01:00)' },
  { value: 'America/New_York', text: 'America/New_York (UTC−05:00)' },
  { value: 'America/Los_Angeles', text: 'America/Los_Angeles (UTC−08:00)' },
  { value: 'Asia/Yekaterinburg', text: 'Asia/Yekaterinburg (UTC+05:00)' },
  { value: 'Asia/Almaty', text: 'Asia/Almaty (UTC+06:00)' },
  { value: 'Asia/Tokyo', text: 'Asia/Tokyo (UTC+09:00)' },
];

const notificationOptions = [
  { key: 'productNews', text: 'Новости продукта' },
  { key: 'systemAlerts', text: 'Системные алерты' },
  { key: 'weeklyDigest', text: 'Дайджест за неделю' },
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitialSettings(): ProfileSettings {
  return {
    name: 'Анна Смирнова',
    email: 'anna@example.com',
    avatarUrl: null,
    language: 'ru',
    timezone: 'Europe/Moscow',
    twoFactorEnabled: true,
    notifications: {
      productNews: true,
      systemAlerts: true,
      weeklyDigest: false,
    },
  };
}

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap={2}>
      <Text variant="subheader-2">{title}</Text>
      {children}
    </Flex>
  );
}

export function App() {
  const initialSettings = useMemo(getInitialSettings, []);
  const [settings, setSettings] = useState(initialSettings);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSettings = (patch: Partial<ProfileSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const handleEmailChange = (email: string) => {
    setErrors((current) => ({
      ...current,
      email: email && !emailPattern.test(email) ? 'Введите корректный email' : undefined,
    }));
    updateSettings({ email });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const avatarUrl = URL.createObjectURL(file);
    setSettings((current) => {
      if (current.avatarUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(current.avatarUrl);
      }
      return { ...current, avatarUrl };
    });
    event.target.value = '';
  };

  const handleNameChange = (name: string) => {
    setErrors((current) => ({
      ...current,
      name: name.trim() ? undefined : 'Введите имя',
    }));
    updateSettings({ name });
  };

  const handleSave = () => {
    if (!settings.name.trim()) {
      setErrors((current) => ({ ...current, name: 'Введите имя' }));
      return;
    }
    if (!emailPattern.test(settings.email)) {
      setErrors((current) => ({ ...current, email: 'Введите корректный email' }));
      return;
    }
    console.log('Сохранить настройки профиля', settings);
  };

  const handleCancel = () => {
    setSettings(initialSettings);
    setErrors({});
  };

  return (
    <Flex justifyContent="center" style={{ minHeight: '100vh', padding: '32px 16px' }}>
      <Card view="outlined" style={{ width: '100%', maxWidth: 680, padding: 32 }}>
        <Text variant="header-2">Настройки профиля</Text>
        <Divider style={{ margin: '24px 0' }} />

        <Flex direction="column" gap={5}>
          <Flex direction="column" gap={4}>
            <Text variant="subheader-2">Аватар</Text>
            <Flex alignItems="center" gap={4}>
              <Avatar
                size="xl"
                shape="circle"
                view="filled"
                title={settings.name || 'Аватар пользователя'}
                {...(settings.avatarUrl
                  ? { imgUrl: settings.avatarUrl, alt: settings.name || 'Аватар пользователя' }
                  : { text: settings.name.slice(0, 1).toUpperCase() })}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <Button view="normal" onClick={() => fileInputRef.current?.click()}>
                Загрузить
              </Button>
              {settings.avatarUrl ? (
                <Button
                  view="flat"
                  onClick={() => {
                    if (settings.avatarUrl?.startsWith('blob:')) {
                      URL.revokeObjectURL(settings.avatarUrl);
                    }
                    updateSettings({ avatarUrl: null });
                  }}
                >
                  Удалить
                </Button>
              ) : null}
            </Flex>
          </Flex>

          <Field title="Имя">
            <TextInput
              value={settings.name}
              onUpdate={handleNameChange}
              validationState={errors.name ? 'invalid' : undefined}
              errorMessage={errors.name}
              placeholder="Введите имя"
            />
          </Field>

          <Field title="Email">
            <TextInput
              value={settings.email}
              onUpdate={handleEmailChange}
              validationState={errors.email ? 'invalid' : undefined}
              errorMessage={errors.email}
              placeholder="user@example.com"
            />
          </Field>

          <Field title="Язык интерфейса">
            <Select
              value={[settings.language]}
              onUpdate={([value]) => updateSettings({ language: value })}
              options={languages}
              width="max"
            />
          </Field>

          <Field title="Часовой пояс">
            <Select
              value={[settings.timezone]}
              onUpdate={([value]) => updateSettings({ timezone: value })}
              options={timezones}
              width="max"
              filterable
            />
          </Field>

          <Flex direction="column" gap={4}>
            <Text variant="subheader-2">Безопасность</Text>
            <Flex alignItems="center" justifyContent="space-between" gap={4}>
              <Text>Двухфакторная авторизация</Text>
              <Switch
                checked={settings.twoFactorEnabled}
                onUpdate={(checked) => updateSettings({ twoFactorEnabled: checked })}
                size="l"
              />
            </Flex>
          </Flex>

          <Flex direction="column" gap={4}>
            <Text variant="subheader-2">Email-уведомления</Text>
            {notificationOptions.map(({ key, text }) => (
              <Checkbox
                key={key}
                checked={settings.notifications[key]}
                onUpdate={(checked) =>
                  updateSettings({
                    notifications: { ...settings.notifications, [key]: checked },
                  })
                }
              >
                {text}
              </Checkbox>
            ))}
          </Flex>
        </Flex>

        <Divider style={{ margin: '32px 0 24px' }} />
        <Flex gap={2} justifyContent="flex-end">
          <Button view="flat" onClick={handleCancel}>
            Отмена
          </Button>
          <Button view="action" onClick={handleSave}>
            Сохранить
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}
