import React, { useState, useRef } from 'react';
import {
  Card,
  Text,
  TextInput,
  Select,
  Switch,
  Checkbox,
  Button,
  Avatar,
} from '@gravity-ui/uikit';

const LANGUAGES = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'es', content: 'Español' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'zh', content: '中文' },
];

const TIMEZONES = [
  { value: 'Europe/Moscow', content: '(GMT+3) Москва' },
  { value: 'Europe/London', content: '(GMT+0) Лондон' },
  { value: 'Europe/Berlin', content: '(GMT+1) Берлин' },
  { value: 'America/New_York', content: '(GMT-5) Нью-Йорк' },
  { value: 'America/Chicago', content: '(GMT-6) Чикаго' },
  { value: 'America/Los_Angeles', content: '(GMT-8) Лос-Анджелес' },
  { value: 'Asia/Tokyo', content: '(GMT+9) Токио' },
  { value: 'Asia/Shanghai', content: '(GMT+8) Шанхай' },
  { value: 'Asia/Dubai', content: '(GMT+4) Дубай' },
  { value: 'Australia/Sydney', content: '(GMT+11) Сидней' },
];

interface FormData {
  name: string;
  email: string;
  avatar: string | null;
  language: string[];
  timezone: string[];
  twoFactorEnabled: boolean;
  newsNotifications: boolean;
  alertNotifications: boolean;
  digestNotifications: boolean;
}

export function SettingsForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    avatar: null,
    language: ['ru'],
    timezone: ['Europe/Moscow'],
    twoFactorEnabled: false,
    newsNotifications: true,
    alertNotifications: true,
    digestNotifications: false,
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log('Сохранённые данные:', formData);
  };

  const handleCancel = () => {
    console.log('Отмена');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
      <Text variant="header-2" as="h1" style={{ marginBottom: 24 }}>
        Настройки профиля
      </Text>

      <Card view="outlined" type="container" style={{ padding: 24 }}>
        {/* Аватар */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div
            onClick={handleAvatarClick}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            {formData.avatar ? (
              <Avatar imgUrl={formData.avatar} size="xl" />
            ) : (
              <Avatar text="?" size="xl" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <Button
            view="flat"
            size="s"
            style={{ marginTop: 8 }}
            onClick={handleAvatarClick}
          >
            Загрузить аватар
          </Button>
        </div>

        {/* Имя */}
        <div style={{ marginBottom: 16 }}>
          <Text variant="body-2" style={{ marginBottom: 4, display: 'block' }}>
            Имя
          </Text>
          <TextInput
            value={formData.name}
            onUpdate={(val) =>
              setFormData((prev) => ({ ...prev, name: val }))
            }
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
            value={formData.email}
            onUpdate={(val) =>
              setFormData((prev) => ({ ...prev, email: val }))
            }
            placeholder="Введите email"
            size="l"
          />
        </div>

        {/* Язык интерфейса */}
        <div style={{ marginBottom: 16 }}>
          <Text variant="body-2" style={{ marginBottom: 4, display: 'block' }}>
            Язык интерфейса
          </Text>
          <Select
            value={formData.language}
            onUpdate={(val) =>
              setFormData((prev) => ({ ...prev, language: val }))
            }
            options={LANGUAGES}
            size="l"
          />
        </div>

        {/* Часовой пояс */}
        <div style={{ marginBottom: 16 }}>
          <Text variant="body-2" style={{ marginBottom: 4, display: 'block' }}>
            Часовой пояс
          </Text>
          <Select
            value={formData.timezone}
            onUpdate={(val) =>
              setFormData((prev) => ({ ...prev, timezone: val }))
            }
            options={TIMEZONES}
            size="l"
          />
        </div>

        {/* 2FA Toggle */}
        <div style={{ marginBottom: 24 }}>
          <Switch
            checked={formData.twoFactorEnabled}
            onUpdate={(val) =>
              setFormData((prev) => ({ ...prev, twoFactorEnabled: val }))
            }
            content="Двухфакторная авторизация"
            size="l"
          />
        </div>

        {/* Email-уведомления */}
        <div style={{ marginBottom: 24 }}>
          <Text variant="body-2" style={{ marginBottom: 8, display: 'block' }}>
            Email-уведомления
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Checkbox
              checked={formData.newsNotifications}
              onUpdate={(val) =>
                setFormData((prev) => ({ ...prev, newsNotifications: val }))
              }
              content="Новости продукта"
              size="l"
            />
            <Checkbox
              checked={formData.alertNotifications}
              onUpdate={(val) =>
                setFormData((prev) => ({ ...prev, alertNotifications: val }))
              }
              content="Системные алерты"
              size="l"
            />
            <Checkbox
              checked={formData.digestNotifications}
              onUpdate={(val) =>
                setFormData((prev) => ({ ...prev, digestNotifications: val }))
              }
              content="Дайджест за неделю"
              size="l"
            />
          </div>
        </div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Button view="action" size="l" onClick={handleSave}>
            Сохранить
          </Button>
          <Button view="flat" size="l" onClick={handleCancel}>
            Отмена
          </Button>
        </div>
      </Card>
    </div>
  );
}
