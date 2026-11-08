import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Select,
  Switch,
  TextInput,
} from '@gravity-ui/uikit';
import Camera from '@gravity-ui/icons/Camera';

import './App.css';

interface ProfileSettings {
  name: string;
  email: string;
  interfaceLanguage: string;
  timeZone: string;
  twoFactorEnabled: boolean;
  emailNotifications: {
    productNews: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
  };
}

interface AppProps {
  initialProfile?: Partial<ProfileSettings>;
  onSave?: (profile: ProfileSettings) => void;
  onCancel?: () => void;
}

const defaultProfile: ProfileSettings = {
  name: '',
  email: '',
  interfaceLanguage: 'ru',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  twoFactorEnabled: false,
  emailNotifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

const languageOptions = [
  { value: 'ru', text: 'Русский' },
  { value: 'en', text: 'English' },
  { value: 'de', text: 'Deutsch' },
  { value: 'fr', text: 'Français' },
  { value: 'es', text: 'Español' },
];

const timeZoneOptions = [
  { value: 'UTC', text: 'UTC' },
  { value: 'Europe/Moscow', text: 'Europe/Moscow' },
  { value: 'Europe/Berlin', text: 'Europe/Berlin' },
  { value: 'Europe/London', text: 'Europe/London' },
  { value: 'America/New_York', text: 'America/New_York' },
  { value: 'America/Los_Angeles', text: 'America/Los_Angeles' },
  { value: 'Asia/Shanghai', text: 'Asia/Shanghai' },
];

const notificationOptions = [
  {
    key: 'productNews' as const,
    label: 'Новости продукта',
  },
  {
    key: 'systemAlerts' as const,
    label: 'Системные алерты',
  },
  {
    key: 'weeklyDigest' as const,
    label: 'Дайджест за неделю',
  },
];

export function App({ initialProfile, onSave, onCancel }: AppProps) {
  const [profile, setProfile] = useState<ProfileSettings>({
    ...defaultProfile,
    ...initialProfile,
    emailNotifications: {
      ...defaultProfile.emailNotifications,
      ...initialProfile?.emailNotifications,
    },
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFileName, setAvatarFileName] = useState<string | null>(null);
  const [avatarInputKey, setAvatarInputKey] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email', string>>>({});

  const selectedLanguage = useMemo(
    () => languageOptions.find((option) => option.value === profile.interfaceLanguage),
    [profile.interfaceLanguage],
  );
  const selectedTimeZone = useMemo(
    () => timeZoneOptions.find((option) => option.value === profile.timeZone),
    [profile.timeZone],
  );

  const updateProfile = (patch: Partial<ProfileSettings>) => {
    setProfile((currentProfile) => ({ ...currentProfile, ...patch }));
  };

  const updateNotification = (key: keyof ProfileSettings['emailNotifications'], checked: boolean) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      emailNotifications: {
        ...currentProfile.emailNotifications,
        [key]: checked,
      },
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);
    setAvatarFileName(file.name);
    setAvatarInputKey((currentKey) => currentKey + 1);
  };

  const validateProfile = () => {
    const nextErrors: typeof errors = {};

    if (!profile.name.trim()) {
      nextErrors.name = 'Укажите имя';
    }

    if (!profile.email.trim()) {
      nextErrors.email = 'Укажите email';
    } else if (!/^\S+@\S+\.\S+$/.test(profile.email)) {
      nextErrors.email = 'Некорректный email';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (validateProfile()) {
      onSave?.(profile);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <main className="settings-page">
      <Card className="settings-card">
        <header className="settings-header">
          <h1>Настройки профиля</h1>
          <p>Управляйте основными данными и уведомлениями.</p>
        </header>

        <section aria-labelledby="profile-fields-title" className="settings-section">
          <h2 id="profile-fields-title">Основное</h2>
          <div className="settings-grid">
            <label className="field field-wide">
              <span className="field-label">Имя</span>
              <TextInput
                value={profile.name}
                placeholder="Введите имя"
                onUpdate={(value) => updateProfile({ name: value })}
                error={errors.name}
                validationState={errors.name ? 'invalid' : undefined}
              />
            </label>

            <label className="field field-wide">
              <span className="field-label">Email</span>
              <TextInput
                type="email"
                value={profile.email}
                placeholder="user@example.com"
                onUpdate={(value) => updateProfile({ email: value })}
                error={errors.email}
                validationState={errors.email ? 'invalid' : undefined}
              />
            </label>
          </div>
        </section>

        <section aria-labelledby="avatar-title" className="settings-section">
          <h2 id="avatar-title">Аватар</h2>
          <div className="avatar-row">
            {avatarUrl ? (
              <Avatar size="xl" alt="Текущий аватар профиля" imgUrl={avatarUrl} />
            ) : (
              <Avatar size="xl" alt="Аватар по умолчанию" theme="brand" text={profile.name || "ПН"} />
            )}
            <div className="avatar-details">
              <Button
                view="outlined"
                size="m"
                startIcon={<Camera />}
                onClick={() => document.getElementById('profile-avatar-input')?.click()}
              >
                Загрузить аватар
              </Button>
              <input
                id="profile-avatar-input"
                key={avatarInputKey}
                className="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <p className="field-hint">
                {avatarFileName || 'PNG, JPG или SVG. Рекомендуемый размер — 256×256.'}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="preferences-title" className="settings-section">
          <h2 id="preferences-title">Интерфейс и уведомления</h2>
          <div className="settings-grid">
            <label className="field">
              <span className="field-label">Язык интерфейса</span>
              <Select
                size="m"
                width="max"
                value={[profile.interfaceLanguage]}
                onUpdate={([value]) => updateProfile({ interfaceLanguage: value })}
                options={languageOptions}
                placeholder={selectedLanguage?.text ?? 'Выберите язык'}
              />
            </label>

            <label className="field">
              <span className="field-label">Часовой пояс</span>
              <Select
                size="m"
                width="max"
                value={[profile.timeZone]}
                onUpdate={([value]) => updateProfile({ timeZone: value })}
                options={timeZoneOptions}
                placeholder={selectedTimeZone?.text ?? 'Выберите часовой пояс'}
              />
            </label>
          </div>

          <div className="toggle-row">
            <Switch
              checked={profile.twoFactorEnabled}
              onUpdate={(checked) => updateProfile({ twoFactorEnabled: checked })}
            >
              Двухфакторная авторизация
            </Switch>
          </div>

          <fieldset className="notifications-group">
            <legend>Email-уведомления</legend>
            {notificationOptions.map((option) => (
              <Checkbox
                key={option.key}
                size="l"
                checked={profile.emailNotifications[option.key]}
                onUpdate={(checked) => updateNotification(option.key, checked)}
              >
                {option.label}
              </Checkbox>
            ))}
          </fieldset>
        </section>

        <footer className="settings-actions">
          <Button className="settings-action-button" view="action" size="m" onClick={handleSave}>
            Сохранить
          </Button>
          <Button className="settings-action-button" view="flat" size="m" onClick={handleCancel}>
            Отмена
          </Button>
        </footer>
      </Card>
    </main>
  );
}
