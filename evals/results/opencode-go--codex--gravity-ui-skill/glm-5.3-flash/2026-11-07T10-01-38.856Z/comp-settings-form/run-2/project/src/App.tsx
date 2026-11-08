import { useCallback, useMemo, useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

interface ProfileSettings {
  name: string;
  email: string;
  avatarUrl: string | null;
  interfaceLanguage: string;
  timeZone: string;
  twoFactorEnabled: boolean;
  emailNotifications: {
    productNews: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
  };
}

const interfaceLanguageOptions = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
];

const timeZoneOptions = [
  { value: 'UTC', content: 'UTC' },
  { value: 'Europe/Moscow', content: 'Europe / Moscow' },
  { value: 'Europe/Berlin', content: 'Europe / Berlin' },
  { value: 'America/New_York', content: 'America / New York' },
  { value: 'Asia/Tokyo', content: 'Asia / Tokyo' },
];

const notificationOptions = [
  { key: 'productNews', label: 'Новости продукта' },
  { key: 'systemAlerts', label: 'Системные алерты' },
  { key: 'weeklyDigest', label: 'Дайджест за неделю' },
] as const;

const initialProfile: ProfileSettings = {
  name: 'Анна Смирнова',
  email: 'anna@example.com',
  avatarUrl: null,
  interfaceLanguage: 'ru',
  timeZone: 'UTC',
  twoFactorEnabled: false,
  emailNotifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

export function App() {
  const [profile, setProfile] = useState<ProfileSettings>(initialProfile);
  const [savedProfile, setSavedProfile] = useState<ProfileSettings>(initialProfile);
  const [submitted, setSubmitted] = useState(false);

  const updateProfile = useCallback(
    (patch: Partial<ProfileSettings>) => {
      setProfile((currentProfile) => ({ ...currentProfile, ...patch }));
    },
    [],
  );

  const updateNotification = useCallback(
    (key: keyof ProfileSettings['emailNotifications'], value: boolean) => {
      setProfile((currentProfile) => ({
        ...currentProfile,
        emailNotifications: {
          ...currentProfile.emailNotifications,
          [key]: value,
        },
      }));
    },
    [],
  );

  const handleAvatarChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const objectUrl = URL.createObjectURL(file);

      setProfile((currentProfile) => {
        if (currentProfile.avatarUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(currentProfile.avatarUrl);
        }

        return { ...currentProfile, avatarUrl: objectUrl };
      });
      event.target.value = '';
    },
    [],
  );

  const emailError = useMemo(() => {
    if (!submitted && profile.email.length === 0) {
      return undefined;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? undefined : 'Введите корректный email';
  }, [profile.email, submitted]);

  const nameError = submitted && profile.name.trim().length === 0 ? 'Введите имя' : undefined;

  const handleSave = useCallback(() => {
    setSubmitted(true);

    if (profile.name.trim().length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      return;
    }

    setSavedProfile(profile);
    setSubmitted(false);
  }, [profile]);

  const handleCancel = useCallback(() => {
    setProfile((currentProfile) => {
      if (currentProfile.avatarUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentProfile.avatarUrl);
      }

      return savedProfile;
    });
    setSubmitted(false);
  }, [savedProfile]);

  return (
    <Box maxWidth={720} style={{ marginInline: 'auto', paddingBlock: 40, paddingInline: 16 }}>
      <Flex direction="column" gap="6">
        <Text as="h1" variant="header-2">
          Настройки профиля
        </Text>

        <Box className="profile-settings-card">
          <Flex direction="column" gap="6">
            <Flex direction="column" gap="4">
              <Text as="h2" variant="subheader-3">
                Основное
              </Text>
              <label className="profile-settings-label" htmlFor="profile-name">
                Имя
              </label>
              <TextInput
                id="profile-name"
                errorMessage={nameError}
                placeholder="Введите имя"
                size="l"
                validationState={nameError ? 'invalid' : undefined}
                value={profile.name}
                onUpdate={(name) => updateProfile({ name })}
              />

              <label className="profile-settings-label" htmlFor="profile-email">
                Email
              </label>
              <TextInput
                id="profile-email"
                autoComplete="email"
                type="email"
                errorMessage={emailError}
                placeholder="Введите email"
                size="l"
                validationState={emailError ? 'invalid' : undefined}
                value={profile.email}
                onUpdate={(email) => updateProfile({ email })}
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="h2" variant="subheader-3">
                Аватар
              </Text>
              <Flex direction={{ s: 'column', m: 'row' }} gap="4" alignItems={{ s: undefined, m: 'center' }}>
                <Avatar size="m" shape="circle" view="filled" theme="brand" text={profile.name} imgUrl={profile.avatarUrl ?? undefined} />
                <label className="profile-settings-upload" htmlFor="profile-avatar">
                  Загрузить аватар
                  <input
                    id="profile-avatar"
                    accept="image/*"
                    className="profile-settings-file-input"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                </label>
              </Flex>
            </Flex>

            <Flex direction="column" gap="4">
              <Text as="h2" variant="subheader-3">
                Локализация
              </Text>
              <label className="profile-settings-label" htmlFor="profile-language">
                Язык интерфейса
              </label>
              <Select
                id="profile-language"
                size="l"
                width="max"
                value={[profile.interfaceLanguage]}
                onUpdate={([interfaceLanguage]) => updateProfile({ interfaceLanguage })}
                options={interfaceLanguageOptions}
              />

              <label className="profile-settings-label" htmlFor="profile-time-zone">
                Часовой пояс
              </label>
              <Select
                id="profile-time-zone"
                size="l"
                width="max"
                value={[profile.timeZone]}
                onUpdate={([timeZone]) => updateProfile({ timeZone })}
                options={timeZoneOptions}
              />
            </Flex>

            <Flex direction="column" gap="4">
              <Text as="h2" variant="subheader-3">
                Безопасность
              </Text>
              <Flex justifyContent="space-between" alignItems="flex-start" gap="4">
                <Flex direction="column">
                  <Text variant="body-1">Двухфакторная авторизация</Text>
                  <Text variant="body-2" color="secondary">
                    Дополнительная защита при входе в аккаунт.
                  </Text>
                </Flex>
                <Switch
                  checked={profile.twoFactorEnabled}
                  onUpdate={(twoFactorEnabled) => updateProfile({ twoFactorEnabled })}
                />
              </Flex>
            </Flex>

            <Flex direction="column" gap="4">
              <Text as="h2" variant="subheader-3">
                Email-уведомления
              </Text>
              <Flex direction="column" gap="3">
                {notificationOptions.map(({ key, label }) => (
                  <Checkbox
                    key={key}
                    checked={profile.emailNotifications[key]}
                    onUpdate={(checked) => updateNotification(key, checked)}
                  >
                    {label}
                  </Checkbox>
                ))}
              </Flex>
            </Flex>
          </Flex>
        </Box>

        <Flex direction={{ s: 'column', m: 'row' }} gap="3" justifyContent="flex-end">
          <Button size="l" view="action" onClick={handleSave}>
            Сохранить
          </Button>
          <Button size="l" view="flat" onClick={handleCancel}>
            Отмена
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
