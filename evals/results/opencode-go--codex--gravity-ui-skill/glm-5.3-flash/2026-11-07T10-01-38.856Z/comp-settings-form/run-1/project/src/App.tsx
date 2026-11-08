import { useState } from 'react';
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
import './ProfileSettings.css';

type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

interface ProfileSettings {
  name: string;
  email: string;
  avatarUrl?: string;
  language: string;
  timeZone: string;
  twoFactorEnabled: boolean;
  notifications: Record<NotificationKey, boolean>;
}

const INITIAL_PROFILE: ProfileSettings = {
  name: 'Иван Иванов',
  email: 'ivan@example.com',
  language: 'ru',
  timeZone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

const LANGUAGE_OPTIONS = [
  { value: 'ru', text: 'Русский' },
  { value: 'en', text: 'English' },
  { value: 'de', text: 'Deutsch' },
  { value: 'fr', text: 'Français' },
];

const TIME_ZONE_OPTIONS = [
  { value: 'Europe/Moscow', text: 'Москва (UTC+3)' },
  { value: 'Europe/Berlin', text: 'Берлин (UTC+1/+2)' },
  { value: 'Europe/London', text: 'Лондон (UTC+0/+1)' },
  { value: 'America/New_York', text: 'Нью-Йорк (UTC−5/−4)' },
  { value: 'Asia/Almaty', text: 'Алматы (UTC+6)' },
];

const NOTIFICATION_FIELDS: { key: NotificationKey; label: string }[] = [
  { key: 'productNews', label: 'Новости продукта' },
  { key: 'systemAlerts', label: 'Системные алерты' },
  { key: 'weeklyDigest', label: 'Дайджест за неделю' },
];

export function App() {
  const [profile, setProfile] = useState<ProfileSettings>(INITIAL_PROFILE);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const setProfileField = <K extends keyof ProfileSettings>(
    key: K,
    value: ProfileSettings[K],
  ) => setProfile((prev) => ({ ...prev, [key]: value }));

  const setNotification = (key: NotificationKey, checked: boolean) =>
    setProfile((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: checked },
    }));

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarFile(file ?? null);
    event.target.value = '';
  };

  const handleCancel = () => {
    setProfile(INITIAL_PROFILE);
    setAvatarFile(null);
  };

  const previewAvatarUrl = avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl;

  return (
    <Flex justifyContent="center" className="profile-settings">
      <Box className="profile-settings__card" as="form" spacing={{ p: 6 }}>
        <Flex direction="column" gap="6">
          <Text variant="header-2">Настройки профиля</Text>

          <Flex direction="column" gap="5">
            <Text variant="subheader-2">Личные данные</Text>

            <Flex gap="5" alignItems="center" wrap>
              <Box className="profile-settings__avatar">
                {previewAvatarUrl ? (
                  <Avatar size="l" imgUrl={previewAvatarUrl} alt="Аватар пользователя" />
                ) : (
                  <Avatar size="l" text={profile.name || 'ИИ'} />
                )}
              </Box>

              <Flex direction="column" gap="2">
                <Button as="label" view="outlined" size="m" htmlFor="profile-avatar-upload">
                  Загрузить аватар
                </Button>
                <Text variant="caption-2" color="secondary">
                  {avatarFile ? avatarFile.name : 'PNG или JPG до 5 МБ'}
                </Text>
                <input
                  id="profile-avatar-upload"
                  className="profile-settings__upload"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleAvatarChange}
                />
              </Flex>
            </Flex>

            <Flex direction={{ s: 'column', m: 'row' }} gap={{ s: '4', m: '5' }}>
              <TextInput
                label="Имя"
                value={profile.name}
                onUpdate={(value) => setProfileField('name', value)}
                placeholder="Введите имя"
                size="l"
              />
              <TextInput
                label="Email"
                type="email"
                value={profile.email}
                onUpdate={(value) => setProfileField('email', value)}
                placeholder="user@example.com"
                size="l"
              />
            </Flex>
          </Flex>

          <Flex direction="column" gap="5">
            <Text variant="subheader-2">Интерфейс</Text>

            <Flex direction={{ s: 'column', m: 'row' }} gap={{ s: '4', m: '5' }}>
              <Select
                label="Язык интерфейса"
                value={[profile.language]}
                onUpdate={([value]) => setProfileField('language', value)}
                options={LANGUAGE_OPTIONS}
                placeholder="Выберите язык"
                size="l"
                width="max"
              />
              <Select
                label="Часовой пояс"
                value={[profile.timeZone]}
                onUpdate={([value]) => setProfileField('timeZone', value)}
                options={TIME_ZONE_OPTIONS}
                placeholder="Выберите часовой пояс"
                size="l"
                width="max"
                filterable
              />
            </Flex>
          </Flex>

          <Flex direction="column" gap="5">
            <Text variant="subheader-2">Безопасность</Text>
            <Flex justifyContent="space-between" gap="4">
              <Flex direction="column">
                <Text variant="body-2">Двухфакторная авторизация</Text>
                <Text variant="body-1" color="secondary">
                  Запрашивать второй фактор при входе в аккаунт
                </Text>
              </Flex>
              <Switch
                checked={profile.twoFactorEnabled}
                onUpdate={(checked) => setProfileField('twoFactorEnabled', checked)}
                size="l"
              />
            </Flex>
          </Flex>

          <Flex direction="column" gap="3">
            <Text variant="subheader-2">Email-уведомления</Text>
            {NOTIFICATION_FIELDS.map((field) => (
              <Checkbox
                key={field.key}
                checked={profile.notifications[field.key]}
                onUpdate={(checked) => setNotification(field.key, checked)}
                size="l"
              >
                {field.label}
              </Checkbox>
            ))}
          </Flex>

          <Flex gap="3" justifyContent="flex-end">
            <Button view="outlined" size="l" type="button" onClick={handleCancel}>
              Отмена
            </Button>
            <Button view="action" size="l" type="submit">
              Сохранить
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}
