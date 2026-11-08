import { useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Select,
  Switch,
  Text,
  TextInput,
  Avatar,
} from '@gravity-ui/uikit';

type Language = 'ru' | 'en' | 'de' | 'fr' | 'es';
type Timezone =
  | 'UTC-12' | 'UTC-11' | 'UTC-10' | 'UTC-9' | 'UTC-8'
  | 'UTC-7' | 'UTC-6' | 'UTC-5' | 'UTC-4' | 'UTC-3'
  | 'UTC-2' | 'UTC-1' | 'UTC+0' | 'UTC+1' | 'UTC+2'
  | 'UTC+3' | 'UTC+4' | 'UTC+5' | 'UTC+6' | 'UTC+7'
  | 'UTC+8' | 'UTC+9' | 'UTC+10' | 'UTC+11' | 'UTC+12';

interface ProfileForm {
  name: string;
  email: string;
  avatar: string | null;
  language: Language;
  timezone: Timezone;
  twoFactorEnabled: boolean;
  notifications: {
    productNews: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
  };
}

const LANGUAGE_OPTIONS: { value: Language; content: string }[] = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
];

const TIMEZONE_OPTIONS: { value: Timezone; content: string }[] = [
  { value: 'UTC-12', content: 'UTC-12:00' },
  { value: 'UTC-11', content: 'UTC-11:00' },
  { value: 'UTC-10', content: 'UTC-10:00' },
  { value: 'UTC-9', content: 'UTC-09:00' },
  { value: 'UTC-8', content: 'UTC-08:00' },
  { value: 'UTC-7', content: 'UTC-07:00' },
  { value: 'UTC-6', content: 'UTC-06:00' },
  { value: 'UTC-5', content: 'UTC-05:00' },
  { value: 'UTC-4', content: 'UTC-04:00' },
  { value: 'UTC-3', content: 'UTC-03:00' },
  { value: 'UTC-2', content: 'UTC-02:00' },
  { value: 'UTC-1', content: 'UTC-01:00' },
  { value: 'UTC+0', content: 'UTC+00:00' },
  { value: 'UTC+1', content: 'UTC+01:00' },
  { value: 'UTC+2', content: 'UTC+02:00' },
  { value: 'UTC+3', content: 'UTC+03:00' },
  { value: 'UTC+4', content: 'UTC+04:00' },
  { value: 'UTC+5', content: 'UTC+05:00' },
  { value: 'UTC+6', content: 'UTC+06:00' },
  { value: 'UTC+7', content: 'UTC+07:00' },
  { value: 'UTC+8', content: 'UTC+08:00' },
  { value: 'UTC+9', content: 'UTC+09:00' },
  { value: 'UTC+10', content: 'UTC+10:00' },
  { value: 'UTC+11', content: 'UTC+11:00' },
  { value: 'UTC+12', content: 'UTC+12:00' },
];

const DEFAULT_FORM: ProfileForm = {
  name: '',
  email: '',
  avatar: null,
  language: 'ru',
  timezone: 'UTC+3',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

export function App() {
  const [form, setForm] = useState<ProfileForm>(DEFAULT_FORM);

  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => update('avatar', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log('Saved:', form);
  };

  const handleCancel = () => {
    setForm(DEFAULT_FORM);
  };

  return (
    <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
      <Card view="outlined" style={{ padding: 32 }}>
        <Text variant="header-2" style={{ marginBottom: 24, display: 'block' }}>
          Настройки профиля
        </Text>

        {/* Avatar */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar
            size="l"
            imgUrl={form.avatar ?? undefined}
            text={form.name || '?'}
          />
          <label
            style={{
              cursor: 'pointer',
              color: 'var(--g-color-text-link)',
              fontSize: 14,
            }}
          >
            Загрузить аватар
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <Text variant="body-2" style={{ marginBottom: 4, display: 'block' }}>
            Имя
          </Text>
          <TextInput
            value={form.name}
            onUpdate={(v) => update('name', v)}
            placeholder="Введите имя"
            size="l"
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <Text variant="body-2" style={{ marginBottom: 4, display: 'block' }}>
            Email
          </Text>
          <TextInput
            type="email"
            value={form.email}
            onUpdate={(v) => update('email', v)}
            placeholder="Введите email"
            size="l"
          />
        </div>

        {/* Language */}
        <div style={{ marginBottom: 16 }}>
          <Text variant="body-2" style={{ marginBottom: 4, display: 'block' }}>
            Язык интерфейса
          </Text>
          <Select
            value={[form.language]}
            onUpdate={(v) => update('language', v[0] as Language)}
            options={LANGUAGE_OPTIONS}
            size="l"
          />
        </div>

        {/* Timezone */}
        <div style={{ marginBottom: 16 }}>
          <Text variant="body-2" style={{ marginBottom: 4, display: 'block' }}>
            Часовой пояс
          </Text>
          <Select
            value={[form.timezone]}
            onUpdate={(v) => update('timezone', v[0] as Timezone)}
            options={TIMEZONE_OPTIONS}
            size="l"
          />
        </div>

        {/* Two-factor auth */}
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text variant="body-2">Двухфакторная авторизация</Text>
          <Switch
            checked={form.twoFactorEnabled}
            onUpdate={(v) => update('twoFactorEnabled', v)}
          />
        </div>

        {/* Email notifications */}
        <div style={{ marginBottom: 24 }}>
          <Text variant="body-2" style={{ marginBottom: 8, display: 'block' }}>
            Email-уведомления
          </Text>
          <Checkbox
            checked={form.notifications.productNews}
            onUpdate={(v) =>
              update('notifications', { ...form.notifications, productNews: v })
            }
            content="Новости продукта"
            size="l"
          />
          <Checkbox
            checked={form.notifications.systemAlerts}
            onUpdate={(v) =>
              update('notifications', { ...form.notifications, systemAlerts: v })
            }
            content="Системные алерты"
            size="l"
          />
          <Checkbox
            checked={form.notifications.weeklyDigest}
            onUpdate={(v) =>
              update('notifications', { ...form.notifications, weeklyDigest: v })
            }
            content="Дайджест за неделю"
            size="l"
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Button view="action" size="l" onClick={handleSave}>
            Сохранить
          </Button>
          <Button view="outlined" size="l" onClick={handleCancel}>
            Отмена
          </Button>
        </div>
      </Card>
    </div>
  );
}
