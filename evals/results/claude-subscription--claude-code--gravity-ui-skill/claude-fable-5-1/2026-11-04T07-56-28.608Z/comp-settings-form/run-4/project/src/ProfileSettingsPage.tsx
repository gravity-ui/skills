import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Icon,
  Select,
  Switch,
  Text,
  TextInput,
  useToaster,
} from '@gravity-ui/uikit';
import { ArrowUpFromSquare, TrashBin } from '@gravity-ui/icons';

import './ProfileSettingsPage.css';

type Notifications = {
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
};

export type ProfileSettings = {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: Notifications;
};

type FieldErrors = Partial<Record<'name' | 'email', string>>;

const LANGUAGE_OPTIONS = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
  { value: 'tr', content: 'Türkçe' },
  { value: 'kk', content: 'Қазақша' },
  { value: 'uz', content: 'Oʻzbekcha' },
];

const FALLBACK_TIMEZONES = [
  'UTC',
  'Europe/Moscow',
  'Europe/Kaliningrad',
  'Europe/Samara',
  'Asia/Yekaterinburg',
  'Asia/Omsk',
  'Asia/Novosibirsk',
  'Asia/Krasnoyarsk',
  'Asia/Irkutsk',
  'Asia/Yakutsk',
  'Asia/Vladivostok',
  'Asia/Magadan',
  'Asia/Kamchatka',
  'Europe/Minsk',
  'Europe/Kiev',
  'Asia/Almaty',
  'Asia/Tashkent',
  'Asia/Tbilisi',
  'Asia/Yerevan',
  'Asia/Baku',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Istanbul',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
];

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 МБ

function getTimezoneNames(): string[] {
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      const values = Intl.supportedValuesOf('timeZone');
      if (values.length > 0) {
        return values.includes('UTC') ? values : ['UTC', ...values];
      }
    }
  } catch {
    // старые браузеры — используем запасной список
  }
  return FALLBACK_TIMEZONES;
}

function getUtcOffset(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(
      new Date(),
    );
    const offset = parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
    return offset === 'GMT' ? 'UTC+0' : offset.replace('GMT', 'UTC');
  } catch {
    return '';
  }
}

const TIMEZONE_OPTIONS = getTimezoneNames().map((zone) => {
  const offset = getUtcOffset(zone);
  return {
    value: zone,
    content: offset ? `(${offset}) ${zone.replace(/_/g, ' ')}` : zone.replace(/_/g, ' '),
  };
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '?';
  }
  return words
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('');
}

function isBlobUrl(url: string | null): url is string {
  return Boolean(url && url.startsWith('blob:'));
}

function validate(settings: ProfileSettings): FieldErrors {
  const errors: FieldErrors = {};
  if (!settings.name.trim()) {
    errors.name = 'Укажите имя';
  }
  if (!settings.email.trim()) {
    errors.email = 'Укажите email';
  } else if (!EMAIL_PATTERN.test(settings.email.trim())) {
    errors.email = 'Некорректный адрес email';
  }
  return errors;
}

function areSettingsEqual(a: ProfileSettings, b: ProfileSettings): boolean {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.avatarUrl === b.avatarUrl &&
    a.language === b.language &&
    a.timezone === b.timezone &&
    a.twoFactorEnabled === b.twoFactorEnabled &&
    a.notifications.productNews === b.notifications.productNews &&
    a.notifications.systemAlerts === b.notifications.systemAlerts &&
    a.notifications.weeklyDigest === b.notifications.weeklyDigest
  );
}

// Имитация сохранения на сервере. Замените на реальный API-вызов.
function saveProfileSettings(settings: ProfileSettings): Promise<ProfileSettings> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(settings), 600);
  });
}

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
};

function Field({ id, label, hint, children }: FieldProps) {
  return (
    <div className="profile-settings__field">
      <Text as="label" variant="body-2" htmlFor={id}>
        {label}
      </Text>
      {children}
      {hint ? (
        <Text variant="caption-2" className="profile-settings__hint">
          {hint}
        </Text>
      ) : null}
    </div>
  );
}

type ProfileSettingsPageProps = {
  initialSettings?: ProfileSettings;
  onSave?: (settings: ProfileSettings) => Promise<ProfileSettings> | ProfileSettings | void;
};

const DEFAULT_SETTINGS: ProfileSettings = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

export function ProfileSettingsPage({ initialSettings = DEFAULT_SETTINGS, onSave }: ProfileSettingsPageProps) {
  const { add: addToast } = useToaster();
  const [savedSettings, setSavedSettings] = React.useState<ProfileSettings>(initialSettings);
  const [form, setForm] = React.useState<ProfileSettings>(initialSettings);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isDirty = !areSettingsEqual(form, savedSettings);

  // Отзываем временный blob-URL превью, когда он больше не используется.
  const previewUrl = isBlobUrl(form.avatarUrl) ? form.avatarUrl : null;
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key: keyof Notifications, value: boolean) => {
    setForm((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
  };

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      addToast({
        name: 'avatar-type',
        theme: 'danger',
        title: 'Неподходящий файл',
        content: 'Выберите изображение (PNG, JPG, WebP).',
      });
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      addToast({
        name: 'avatar-size',
        theme: 'danger',
        title: 'Файл слишком большой',
        content: 'Максимальный размер аватара — 5 МБ.',
      });
      return;
    }
    update('avatarUrl', URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload: ProfileSettings = { ...form, name: form.name.trim(), email: form.email.trim() };
    setIsSaving(true);
    try {
      const result = (await (onSave ? onSave(payload) : saveProfileSettings(payload))) ?? payload;
      setSavedSettings(result);
      setForm(result);
      addToast({
        name: 'profile-saved',
        theme: 'success',
        title: 'Настройки сохранены',
        autoHiding: 4000,
      });
    } catch (error) {
      addToast({
        name: 'profile-save-error',
        theme: 'danger',
        title: 'Не удалось сохранить',
        content: error instanceof Error ? error.message : 'Попробуйте ещё раз.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(savedSettings);
    setErrors({});
  };

  return (
    <Box as="main" className="profile-settings" spacing={{ p: 6 }}>
      <Flex direction="column" gap={5}>
        <Flex direction="column" gap={1}>
          <Text as="h1" variant="header-1">
            Настройки профиля
          </Text>
          <Text variant="body-1" color="secondary">
            Личные данные, язык интерфейса, безопасность и уведомления.
          </Text>
        </Flex>

        <Card type="container" view="outlined" spacing={{ p: 6 }}>
          <Flex direction="column" gap={6}>
            {/* Профиль */}
            <Flex direction="column" gap={4}>
              <Text as="h2" variant="subheader-2">
                Профиль
              </Text>

              <Flex alignItems="center" gap={4} wrap>
                {form.avatarUrl ? (
                  <Avatar
                    size="xl"
                    imgUrl={form.avatarUrl}
                    alt={`Аватар пользователя ${form.name}`}
                    style={{ flexShrink: 0 }}
                  />
                ) : (
                  <Avatar size="xl" theme="brand" text={getInitials(form.name)} style={{ flexShrink: 0 }} />
                )}
                <Flex direction="column" gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Flex gap={2} wrap>
                    <Button view="outlined" size="m" onClick={() => fileInputRef.current?.click()}>
                      <Icon data={ArrowUpFromSquare} size={16} />
                      {form.avatarUrl ? 'Заменить фото' : 'Загрузить фото'}
                    </Button>
                    {form.avatarUrl ? (
                      <Button view="flat-danger" size="m" onClick={() => update('avatarUrl', null)}>
                        <Icon data={TrashBin} size={16} />
                        Удалить
                      </Button>
                    ) : null}
                  </Flex>
                  <Text variant="caption-2" color="secondary">
                    PNG, JPG или WebP, до 5 МБ.
                  </Text>
                  <input
                    ref={fileInputRef}
                    className="profile-settings__file-input"
                    type="file"
                    accept="image/*"
                    aria-label="Загрузить аватар"
                    onChange={handleAvatarFile}
                  />
                </Flex>
              </Flex>

              <Field id="profile-name" label="Имя">
                <TextInput
                  id="profile-name"
                  size="l"
                  value={form.name}
                  onUpdate={(value) => {
                    update('name', value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder="Имя и фамилия"
                  autoComplete="name"
                  validationState={errors.name ? 'invalid' : undefined}
                  errorMessage={errors.name}
                  errorPlacement="outside"
                />
              </Field>

              <Field id="profile-email" label="Email">
                <TextInput
                  id="profile-email"
                  size="l"
                  type="email"
                  value={form.email}
                  onUpdate={(value) => {
                    update('email', value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  validationState={errors.email ? 'invalid' : undefined}
                  errorMessage={errors.email}
                  errorPlacement="outside"
                />
              </Field>
            </Flex>

            <Divider />

            {/* Локализация */}
            <Flex direction="column" gap={4}>
              <Text as="h2" variant="subheader-2">
                Язык и время
              </Text>

              <Field id="profile-language" label="Язык интерфейса">
                <Select
                  id="profile-language"
                  size="l"
                  width="max"
                  options={LANGUAGE_OPTIONS}
                  value={[form.language]}
                  onUpdate={(values) => update('language', values[0] ?? form.language)}
                  placeholder="Выберите язык"
                />
              </Field>

              <Field
                id="profile-timezone"
                label="Часовой пояс"
                hint="Используется для отображения дат и времени отправки уведомлений."
              >
                <Select
                  id="profile-timezone"
                  size="l"
                  width="max"
                  filterable
                  filterPlaceholder="Поиск по названию"
                  options={TIMEZONE_OPTIONS}
                  value={[form.timezone]}
                  onUpdate={(values) => update('timezone', values[0] ?? form.timezone)}
                  placeholder="Выберите часовой пояс"
                />
              </Field>
            </Flex>

            <Divider />

            {/* Безопасность */}
            <Flex direction="column" gap={4}>
              <Text as="h2" variant="subheader-2">
                Безопасность
              </Text>

              <Flex alignItems="flex-start" justifyContent="space-between" gap={4}>
                <Flex direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body-2">Двухфакторная авторизация</Text>
                  <Text variant="caption-2" color="secondary">
                    При входе потребуется код из приложения-аутентификатора.
                  </Text>
                </Flex>
                <Switch
                  size="l"
                  checked={form.twoFactorEnabled}
                  onUpdate={(checked) => update('twoFactorEnabled', checked)}
                  controlProps={{ 'aria-label': 'Двухфакторная авторизация' }}
                  style={{ flexShrink: 0 }}
                />
              </Flex>
            </Flex>

            <Divider />

            {/* Уведомления */}
            <Flex direction="column" gap={4}>
              <Flex direction="column" gap={1}>
                <Text as="h2" variant="subheader-2">
                  Email-уведомления
                </Text>
                <Text variant="caption-2" color="secondary">
                  Письма будут приходить на {form.email.trim() || 'указанный email'}.
                </Text>
              </Flex>

              <Flex direction="column" gap={3}>
                <Checkbox
                  size="l"
                  checked={form.notifications.productNews}
                  onUpdate={(checked) => updateNotification('productNews', checked)}
                  content="Новости продукта"
                />
                <Checkbox
                  size="l"
                  checked={form.notifications.systemAlerts}
                  onUpdate={(checked) => updateNotification('systemAlerts', checked)}
                  content="Системные алерты"
                />
                <Checkbox
                  size="l"
                  checked={form.notifications.weeklyDigest}
                  onUpdate={(checked) => updateNotification('weeklyDigest', checked)}
                  content="Дайджест за неделю"
                />
              </Flex>
            </Flex>
          </Flex>
        </Card>

        <Flex justifyContent="flex-end" gap={3} wrap>
          <Button view="flat" size="l" onClick={handleCancel} disabled={isSaving || !isDirty}>
            Отмена
          </Button>
          <Button view="action" size="l" onClick={handleSave} loading={isSaving} disabled={!isDirty}>
            Сохранить
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
