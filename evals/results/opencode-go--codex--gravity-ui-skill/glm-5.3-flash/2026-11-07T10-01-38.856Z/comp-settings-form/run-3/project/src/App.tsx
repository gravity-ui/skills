import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
  useFileInput,
} from '@gravity-ui/uikit';

interface ProfileSettings {
  name: string;
  email: string;
  avatarUrl?: string;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  emailNotifications: {
    productUpdates: boolean;
    securityAlerts: boolean;
    weeklyDigest: boolean;
  };
}

const initialProfile: ProfileSettings = {
  name: 'Anna Ivanova',
  email: 'anna@example.com',
  language: 'ru',
  timezone: 'UTC+03:00 — Europe/Moscow',
  twoFactorEnabled: true,
  emailNotifications: {
    productUpdates: true,
    securityAlerts: true,
    weeklyDigest: false,
  },
};

const languages = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
];

const timezones = [
  { value: 'UTC+03:00 — Europe/Moscow', label: 'UTC+03:00 — Europe/Moscow' },
  { value: 'UTC+00:00 — Europe/London', label: 'UTC+00:00 — Europe/London' },
  { value: 'UTC-05:00 — America/New_York', label: 'UTC-05:00 — America/New_York' },
  { value: 'UTC+09:00 — Asia/Tokyo', label: 'UTC+09:00 — Asia/Tokyo' },
];

const notificationFields = [
  { key: 'productUpdates', label: 'Новости продукта' },
  { key: 'securityAlerts', label: 'События безопасности' },
  { key: 'weeklyDigest', label: 'Недельная сводка' },
] as const;

export function App() {
  const [profile, setProfile] = React.useState(initialProfile);
  const [savedProfile, setSavedProfile] = React.useState(initialProfile);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  const {controlProps, triggerProps} = useFileInput({
    onUpdate: (files) => {
      const file = files[0];
      if (!file) {
        return;
      }

      setProfile((currentProfile) => ({
        ...currentProfile,
        avatarUrl: URL.createObjectURL(file),
      }));
      setIsSaved(false);
    },
  });

  const isDirty = JSON.stringify(profile) !== JSON.stringify(savedProfile);

  const updateProfile = <Key extends keyof ProfileSettings>(key: Key, value: ProfileSettings[Key]) => {
    setProfile((currentProfile) => ({...currentProfile, [key]: value}));
    setIsSaved(false);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile.name.trim() || !profile.email.trim()) {
      return;
    }

    setIsSaving(true);
    window.setTimeout(() => {
      setSavedProfile(profile);
      setIsSaving(false);
      setIsSaved(true);
    }, 400);
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setIsSaved(false);
  };

  return (
    <Box className="page" spacing={{px: 4, py: 6}}>
      <Card view="outlined" className="settings-card">
        <form onSubmit={handleSave}>
          <Flex direction="column" gapRow={6}>
            <Flex direction="column" gapRow={2}>
              <Text variant="header-2">Настройки профиля</Text>
              <Text variant="body-2" color="secondary">
                Управляйте контактной информацией, языком интерфейса и уведомлениями.
              </Text>
            </Flex>

            <Flex direction={{s: 'column', m: 'row'}} gapRow={4} gap={6} alignItems="flex-start">
              <Flex direction="column" alignItems="center" gapRow={2}>
                <Avatar
                  size="xl"
                  shape="circle"
                  {...(profile.avatarUrl ? {imgUrl: profile.avatarUrl} : {text: profile.name})}
                />
                <input
                  {...controlProps}
                  type="file"
                  accept="image/*"
                  className="visually-hidden-input"
                  aria-label="Загрузить аватар"
                />
                <Button {...triggerProps} view="normal" size="s">
                  Загрузить аватар
                </Button>
              </Flex>

              <Flex direction="column" grow={true} gapRow={4} className="settings-fields">
                <Flex direction="column" gapRow={2}>
                  <Text as="label" htmlFor="profile-name" variant="subheader-1">Имя</Text>
                  <TextInput
                    id="profile-name"
                    value={profile.name}
                    onUpdate={(value) => updateProfile('name', value)}
                    placeholder="Ваше имя"
                    size="l"
                  />
                </Flex>

                <Flex direction="column" gapRow={2}>
                  <Text as="label" htmlFor="profile-email" variant="subheader-1">Email</Text>
                  <TextInput
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onUpdate={(value) => updateProfile('email', value)}
                    placeholder="name@company.com"
                    size="l"
                  />
                </Flex>
              </Flex>
            </Flex>

            <Flex direction={{s: 'column', m: 'row'}} gapRow={4} gap={6}>
              <Flex direction="column" grow={true} gapRow={2}>
                <Text as="label" htmlFor="profile-language" variant="subheader-1">Язык интерфейса</Text>
                <Select
                  size="l"
                  width="max"
                  aria-label="Язык интерфейса"
                  value={[profile.language]}
                  onUpdate={([value]) => updateProfile('language', value)}
                  options={languages}
                />
              </Flex>

              <Flex direction="column" grow={true} gapRow={2}>
                <Text as="label" htmlFor="profile-timezone" variant="subheader-1">Часовой пояс</Text>
                <Select
                  size="l"
                  width="max"
                  aria-label="Часовой пояс"
                  value={[profile.timezone]}
                  onUpdate={([value]) => updateProfile('timezone', value)}
                  options={timezones}
                />
              </Flex>
            </Flex>

            <Card type="container" view="filled" className="notification-block">
              <Flex direction="column" gapRow={3}>
                <Flex direction="row" justifyContent="space-between" alignItems="center">
                  <Flex direction="column">
                    <Text variant="subheader-1">Двухфакторная аутентификация</Text>
                    <Text variant="body-2" color="secondary">
                      Требовать код подтверждения при входе в аккаунт.
                    </Text>
                  </Flex>
                  <Switch
                    checked={profile.twoFactorEnabled}
                    onUpdate={(checked) => updateProfile('twoFactorEnabled', checked)}
                    aria-label="Двухфакторная аутентификация"
                  />
                </Flex>

                <Flex direction="column" gapRow={2}>
                  <Text variant="subheader-1">Email-уведомления</Text>
                  {notificationFields.map((field) => (
                    <Checkbox
                      key={field.key}
                      size="l"
                      checked={profile.emailNotifications[field.key]}
                      onUpdate={(checked) =>
                        updateProfile('emailNotifications', {
                          ...profile.emailNotifications,
                          [field.key]: checked,
                        })
                      }
                    >
                      {field.label}
                    </Checkbox>
                  ))}
                </Flex>
              </Flex>
            </Card>

            <Flex gap={3} justifyContent="flex-end" alignItems="center">
              {isSaved && !isDirty && <Text color="positive">Настройки сохранены</Text>}
              <Button type="button" view="flat" size="l" onClick={handleCancel} disabled={!isDirty}>
                Отменить
              </Button>
              <Button type="submit" view="action" size="l" loading={isSaving} disabled={!isDirty}>
                Сохранить
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Box>
  );
}
