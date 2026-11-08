import React, { useState, useRef } from 'react';
import {
  Button,
  Card,
  Text,
  TextInput,
  Select,
  Switch,
  Checkbox,
  Avatar,
} from '@gravity-ui/uikit';

const LANGUAGES = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'es', content: 'Español' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
];

const TIMEZONES = [
  { value: 'UTC-12:00', content: '(UTC-12:00) Международная линия перемены дат' },
  { value: 'UTC-08:00', content: '(UTC-08:00) Тихоокеанское время' },
  { value: 'UTC-05:00', content: '(UTC-05:00) Восточное время' },
  { value: 'UTC+00:00', content: '(UTC+00:00) Лондон' },
  { value: 'UTC+03:00', content: '(UTC+03:00) Москва' },
  { value: 'UTC+08:00', content: '(UTC+08:00) Пекин' },
  { value: 'UTC+09:00', content: '(UTC+09:00) Токио' },
];

type Notifications = {
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
};

type FormData = {
  name: string;
  email: string;
  language: string[];
  timezone: string[];
  twoFactor: boolean;
  notifications: Notifications;
};

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  language: ['ru'],
  timezone: ['UTC+03:00'],
  twoFactor: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

function App() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    console.log('Saved:', { ...form, avatarUrl });
  };

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setAvatarUrl(null);
  };

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <Text variant="header-1" style={{ marginBottom: 24, display: 'block' }}>
        Настройки профиля
      </Text>

      <Card view="filled" style={{ padding: 24 }}>
        {/* Avatar */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar
            size="xl"
            imgUrl={avatarUrl ?? undefined}
            text={form.name || '?'}
          />
          <div>
            <Text variant="body-2">Аватар</Text>
            <div style={{ marginTop: 4 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
              />
              <Button view="outlined" size="s" onClick={() => fileInputRef.current?.click()}>
                Загрузить
              </Button>
            </div>
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <TextInput
            label="Имя"
            value={form.name}
            onUpdate={(v) => updateField('name', v)}
            placeholder="Введите имя"
            size="l"
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <TextInput
            label="Email"
            type="email"
            value={form.email}
            onUpdate={(v) => updateField('email', v)}
            placeholder="Введите email"
            size="l"
          />
        </div>

        {/* Language */}
        <div style={{ marginBottom: 16 }}>
          <Select
            label="Язык интерфейса"
            value={form.language}
            onUpdate={(v) => updateField('language', v)}
            options={LANGUAGES}
            size="l"
          />
        </div>

        {/* Timezone */}
        <div style={{ marginBottom: 16 }}>
          <Select
            label="Часовой пояс"
            value={form.timezone}
            onUpdate={(v) => updateField('timezone', v)}
            options={TIMEZONES}
            size="l"
          />
        </div>

        {/* Two-factor auth */}
        <div style={{ marginBottom: 24 }}>
          <Switch
            checked={form.twoFactor}
            onUpdate={(v) => updateField('twoFactor', v)}
          >
            <Text variant="body-2">Двухфакторная авторизация</Text>
          </Switch>
        </div>

        {/* Email notifications */}
        <div style={{ marginBottom: 24 }}>
          <Text variant="subheader-2" style={{ marginBottom: 8, display: 'block' }}>
            Email-уведомления
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Checkbox
              checked={form.notifications.productNews}
              onUpdate={(v) =>
                updateField('notifications', { ...form.notifications, productNews: v })
              }
            >
              Новости продукта
            </Checkbox>
            <Checkbox
              checked={form.notifications.systemAlerts}
              onUpdate={(v) =>
                updateField('notifications', { ...form.notifications, systemAlerts: v })
              }
            >
              Системные алерты
            </Checkbox>
            <Checkbox
              checked={form.notifications.weeklyDigest}
              onUpdate={(v) =>
                updateField('notifications', { ...form.notifications, weeklyDigest: v })
              }
            >
              Дайджест за неделю
            </Checkbox>
          </div>
        </div>

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

export { App };
