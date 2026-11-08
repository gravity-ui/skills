import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Divider,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export interface ProfileFormValues {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: Record<NotificationKey, boolean>;
}

const LANGUAGE_OPTIONS = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'es', content: 'Español' },
  { value: 'fr', content: 'Français' },
  { value: 'zh', content: '中文' },
];

const TIMEZONE_OPTIONS = [
  { value: 'UTC', content: '(UTC+00:00) UTC' },
  { value: 'Europe/London', content: '(UTC+00:00) Лондон' },
  { value: 'Europe/Berlin', content: '(UTC+01:00) Берлин, Париж, Рим' },
  { value: 'Europe/Kyiv', content: '(UTC+02:00) Киев, Вильнюс, Рига' },
  { value: 'Europe/Moscow', content: '(UTC+03:00) Москва, Санкт-Петербург' },
  { value: 'Asia/Dubai', content: '(UTC+04:00) Дубай, Баку' },
  { value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург' },
  { value: 'Asia/Almaty', content: '(UTC+05:00) Алматы, Ташкент' },
  { value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск' },
  { value: 'Asia/Bangkok', content: '(UTC+07:00) Бангкок, Джакарта' },
  { value: 'Asia/Shanghai', content: '(UTC+08:00) Пекин, Гонконг, Сингапур' },
  { value: 'Asia/Tokyo', content: '(UTC+09:00) Токио, Сеул' },
  { value: 'Australia/Sydney', content: '(UTC+10:00) Сидней' },
  { value: 'America/Sao_Paulo', content: '(UTC−03:00) Сан-Паулу' },
  { value: 'America/New_York', content: '(UTC−05:00) Нью-Йорк' },
  { value: 'America/Chicago', content: '(UTC−06:00) Чикаго' },
  { value: 'America/Denver', content: '(UTC−07:00) Денвер' },
  { value: 'America/Los_Angeles', content: '(UTC−08:00) Лос-Анджелес' },
];

const NOTIFICATION_OPTIONS: { key: NotificationKey; title: string; description: string }[] = [
  { key: 'productNews', title: 'Новости продукта', description: 'Релизы, новые функции и обновления.' },
  { key: 'systemAlerts', title: 'Системные алерты', description: 'Сбои, инциденты и важные предупреждения.' },
  { key: 'weeklyDigest', title: 'Дайджест за неделю', description: 'Сводка активности раз в неделю.' },
];

const DEFAULT_VALUES: ProfileFormValues = {
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

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<'name' | 'email', string>>;

function validate(values: ProfileFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) {
    errors.name = 'Укажите имя';
  }
  if (!values.email.trim()) {
    errors.email = 'Укажите email';
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Некорректный email';
  }
  return errors;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export interface ProfileSettingsProps {
  initialValues?: ProfileFormValues;
  onSave?: (values: ProfileFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function ProfileSettings({
  initialValues = DEFAULT_VALUES,
  onSave,
  onCancel,
}: ProfileSettingsProps) {
  const [savedValues, setSavedValues] = useState<ProfileFormValues>(initialValues);
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Object URLs created for uploaded previews; revoked when no longer needed.
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(savedValues),
    [values, savedValues],
  );

  const update = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSavedBanner(false);
    if (key === 'name' || key === 'email') {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const updateNotification = (key: NotificationKey, checked: boolean) => {
    setValues((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: checked },
    }));
    setSavedBanner(false);
  };

  const releasePreviewUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so selecting the same file again re-triggers onChange.
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Можно загрузить только изображение (PNG, JPG, GIF, WebP).');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Файл слишком большой. Максимальный размер — 2 МБ.');
      return;
    }

    releasePreviewUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setAvatarError(null);
    update('avatarUrl', url);
  };

  const handleAvatarRemove = () => {
    releasePreviewUrl();
    setAvatarError(null);
    update('avatarUrl', null);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const normalized: ProfileFormValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    };

    setSaving(true);
    try {
      await onSave?.(normalized);
      setSavedValues(normalized);
      setValues(normalized);
      setSavedBanner(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (values.avatarUrl !== savedValues.avatarUrl) {
      releasePreviewUrl();
    }
    setValues(savedValues);
    setErrors({});
    setAvatarError(null);
    setSavedBanner(false);
    onCancel?.();
  };

  return (
    <form onSubmit={handleSave} noValidate style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="1">
          <Text variant="header-2" as="h1">
            Настройки профиля
          </Text>
          <Text variant="body-1" color="secondary">
            Личные данные, язык, часовой пояс и безопасность аккаунта.
          </Text>
        </Flex>

        {savedBanner && (
          <Alert
            theme="success"
            title="Изменения сохранены"
            onClose={() => setSavedBanner(false)}
          />
        )}

        {/* Личные данные */}
        <Section title="Личные данные">
          <Flex gap="5" alignItems="center">
            {values.avatarUrl ? (
              <Avatar size="xl" imgUrl={values.avatarUrl} alt="Аватар" />
            ) : (
              <Avatar size="xl" text={getInitials(values.name)} theme="brand" />
            )}
            <Flex direction="column" gap="2">
              <Flex gap="2">
                <Button view="outlined" size="m" onClick={() => fileInputRef.current?.click()}>
                  {values.avatarUrl ? 'Заменить' : 'Загрузить'}
                </Button>
                {values.avatarUrl && (
                  <Button view="flat-danger" size="m" onClick={handleAvatarRemove}>
                    Удалить
                  </Button>
                )}
              </Flex>
              <Text variant="caption-2" color={avatarError ? 'danger' : 'secondary'}>
                {avatarError ?? 'PNG, JPG, GIF или WebP, до 2 МБ.'}
              </Text>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                aria-label="Загрузить аватар"
              />
            </Flex>
          </Flex>

          <Field label="Имя" htmlFor="profile-name">
            <TextInput
              id="profile-name"
              size="l"
              value={values.name}
              onUpdate={(v) => update('name', v)}
              placeholder="Как к вам обращаться"
              validationState={errors.name ? 'invalid' : undefined}
              errorMessage={errors.name}
              autoComplete="name"
            />
          </Field>

          <Field label="Email" htmlFor="profile-email">
            <TextInput
              id="profile-email"
              type="email"
              size="l"
              value={values.email}
              onUpdate={(v) => update('email', v)}
              placeholder="name@example.com"
              validationState={errors.email ? 'invalid' : undefined}
              errorMessage={errors.email}
              autoComplete="email"
            />
          </Field>
        </Section>

        <Divider />

        {/* Региональные настройки */}
        <Section title="Региональные настройки">
          <Field label="Язык интерфейса" htmlFor="profile-language">
            <Select
              id="profile-language"
              size="l"
              width="max"
              value={[values.language]}
              onUpdate={([v]) => v && update('language', v)}
              options={LANGUAGE_OPTIONS}
              placeholder="Выберите язык"
            />
          </Field>

          <Field label="Часовой пояс" htmlFor="profile-timezone">
            <Select
              id="profile-timezone"
              size="l"
              width="max"
              filterable
              filterPlaceholder="Поиск по городу"
              value={[values.timezone]}
              onUpdate={([v]) => v && update('timezone', v)}
              options={TIMEZONE_OPTIONS}
              placeholder="Выберите часовой пояс"
            />
          </Field>
        </Section>

        <Divider />

        {/* Безопасность */}
        <Section title="Безопасность">
          <Flex justifyContent="space-between" alignItems="center" gap="4">
            <Flex direction="column" gap="0.5">
              <Text variant="body-2">Двухфакторная авторизация</Text>
              <Text variant="caption-2" color="secondary">
                При входе дополнительно запрашивать код из приложения-аутентификатора.
              </Text>
            </Flex>
            <Switch
              size="l"
              checked={values.twoFactorEnabled}
              onUpdate={(checked) => update('twoFactorEnabled', checked)}
              aria-label="Двухфакторная авторизация"
            />
          </Flex>
        </Section>

        <Divider />

        {/* Уведомления */}
        <Section title="Email-уведомления">
          <Flex direction="column" gap="3">
            {NOTIFICATION_OPTIONS.map((option) => (
              <Checkbox
                key={option.key}
                size="l"
                checked={values.notifications[option.key]}
                onUpdate={(checked) => updateNotification(option.key, checked)}
              >
                <Flex direction="column" gap="0.5">
                  <Text variant="body-2">{option.title}</Text>
                  <Text variant="caption-2" color="secondary">
                    {option.description}
                  </Text>
                </Flex>
              </Checkbox>
            ))}
          </Flex>
        </Section>

        <Divider />

        <Flex gap="3" justifyContent="flex-end">
          <Button view="flat" size="l" type="button" onClick={handleCancel} disabled={saving}>
            Отмена
          </Button>
          <Button
            view="action"
            size="l"
            type="submit"
            loading={saving}
            disabled={!isDirty && !saving}
          >
            Сохранить
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap="4">
      <Text variant="subheader-2" as="h2">
        {title}
      </Text>
      {children}
    </Flex>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="column" gap="1">
      <Text variant="body-1" as="label" {...{ htmlFor }}>
        {label}
      </Text>
      {children}
    </Flex>
  );
}
