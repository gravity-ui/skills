import React, { useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Select,
  Switch,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

interface ProfileFormData {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  emailNotifications: {
    productNews: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
  };
}

const LANGUAGES = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
];

const TIMEZONES = [
  { value: 'Europe/Moscow', content: 'Europe/Moscow (UTC+3)' },
  { value: 'Europe/London', content: 'Europe/London (UTC+0)' },
  { value: 'Europe/Berlin', content: 'Europe/Berlin (UTC+1)' },
  { value: 'America/New_York', content: 'America/New_York (UTC-5)' },
  { value: 'America/Chicago', content: 'America/Chicago (UTC-6)' },
  { value: 'America/Los_Angeles', content: 'America/Los_Angeles (UTC-8)' },
  { value: 'Asia/Tokyo', content: 'Asia/Tokyo (UTC+9)' },
  { value: 'Asia/Shanghai', content: 'Asia/Shanghai (UTC+8)' },
  { value: 'Asia/Dubai', content: 'Asia/Dubai (UTC+4)' },
];

const FIELD_ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const LABEL_STYLE: React.CSSProperties = {
  fontWeight: 500,
};

export function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileFormData>({
    name: '',
    email: '',
    avatarUrl: null,
    language: 'ru',
    timezone: 'Europe/Moscow',
    twoFactorEnabled: false,
    emailNotifications: {
      productNews: false,
      systemAlerts: true,
      weeklyDigest: false,
    },
  });

  const updateField = <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateField('avatarUrl', url);
    }
  };

  const handleNotificationChange = (
    key: keyof ProfileFormData['emailNotifications'],
    checked: boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      emailNotifications: { ...prev.emailNotifications, [key]: checked },
    }));
  };

  const handleSave = () => {
    console.log('Saved:', form);
  };

  const handleCancel = () => {
    setForm({
      name: '',
      email: '',
      avatarUrl: null,
      language: 'ru',
      timezone: 'Europe/Moscow',
      twoFactorEnabled: false,
      emailNotifications: {
        productNews: false,
        systemAlerts: true,
        weeklyDigest: false,
      },
    });
  };

  return (
    <div style={{ maxWidth: 640, margin: '32px auto', padding: '0 16px' }}>
      <Card type="container" view="outlined" style={{ padding: 32 }}>
        <Text variant="header-1" style={{ marginBottom: 32 }}>
          Настройки профиля
        </Text>

        {/* Avatar */}
        <div style={FIELD_ROW_STYLE}>
          <Text variant="body-2" style={LABEL_STYLE}>
            Аватар
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar
              size="xl"
              imgUrl={form.avatarUrl ?? undefined}
              text={form.name || '?'}
            />
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <Button
                view="outlined"
                size="m"
                onClick={() => fileInputRef.current?.click()}
              >
                Загрузить
              </Button>
            </div>
          </div>
        </div>

        <div style={{ height: 24 }} />

        {/* Name */}
        <div style={FIELD_ROW_STYLE}>
          <Text variant="body-2" style={LABEL_STYLE}>
            Имя
          </Text>
          <TextInput
            value={form.name}
            onUpdate={(val) => updateField('name', val)}
            placeholder="Введите имя"
          />
        </div>

        <div style={{ height: 20 }} />

        {/* Email */}
        <div style={FIELD_ROW_STYLE}>
          <Text variant="body-2" style={LABEL_STYLE}>
            Email
          </Text>
          <TextInput
            type="email"
            value={form.email}
            onUpdate={(val) => updateField('email', val)}
            placeholder="email@example.com"
          />
        </div>

        <div style={{ height: 20 }} />

        {/* Language */}
        <div style={FIELD_ROW_STYLE}>
          <Text variant="body-2" style={LABEL_STYLE}>
            Язык интерфейса
          </Text>
          <Select
            value={[form.language]}
            onUpdate={(val) => updateField('language', val[0])}
            options={LANGUAGES}
          />
        </div>

        <div style={{ height: 20 }} />

        {/* Timezone */}
        <div style={FIELD_ROW_STYLE}>
          <Text variant="body-2" style={LABEL_STYLE}>
            Часовой пояс
          </Text>
          <Select
            value={[form.timezone]}
            onUpdate={(val) => updateField('timezone', val[0])}
            options={TIMEZONES}
          />
        </div>

        <div style={{ height: 24 }} />

        {/* Two-factor auth */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text variant="body-2" style={LABEL_STYLE}>
            Двухфакторная авторизация
          </Text>
          <Switch
            checked={form.twoFactorEnabled}
            onUpdate={(checked) => updateField('twoFactorEnabled', checked)}
          />
        </div>

        <div style={{ height: 24 }} />

        {/* Email notifications */}
        <div style={FIELD_ROW_STYLE}>
          <Text variant="body-2" style={LABEL_STYLE}>
            Email-уведомления
          </Text>
          <Checkbox
            size="m"
            checked={form.emailNotifications.productNews}
            onUpdate={(checked) =>
              handleNotificationChange('productNews', checked)
            }
            content="Новости продукта"
          />
          <Checkbox
            size="m"
            checked={form.emailNotifications.systemAlerts}
            onUpdate={(checked) =>
              handleNotificationChange('systemAlerts', checked)
            }
            content="Системные алерты"
          />
          <Checkbox
            size="m"
            checked={form.emailNotifications.weeklyDigest}
            onUpdate={(checked) =>
              handleNotificationChange('weeklyDigest', checked)
            }
            content="Дайджест за неделю"
          />
        </div>

        <div style={{ height: 32 }} />

        {/* Actions */}
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
