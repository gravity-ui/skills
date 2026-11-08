import React from 'react';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

export type NotificationKey = 'product' | 'alerts' | 'digest';

export interface ProfileSettingsValues {
  name: string;
  email: string;
  /** URL аватара (в т.ч. blob: для только что выбранного файла) */
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: Record<NotificationKey, boolean>;
}

export interface ProfileSettingsProps {
  initialValues?: ProfileSettingsValues;
  /** Вызывается с валидными значениями и выбранным файлом аватара (если он менялся). */
  onSave?: (values: ProfileSettingsValues, avatarFile: File | null) => Promise<void> | void;
  onCancel?: () => void;
}

const LANGUAGES = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
];

const TIMEZONES = [
  { value: 'Europe/Kaliningrad', content: '(UTC+2) Калининград' },
  { value: 'Europe/Moscow', content: '(UTC+3) Москва' },
  { value: 'Europe/Samara', content: '(UTC+4) Самара' },
  { value: 'Asia/Yekaterinburg', content: '(UTC+5) Екатеринбург' },
  { value: 'Asia/Omsk', content: '(UTC+6) Омск' },
  { value: 'Asia/Novosibirsk', content: '(UTC+7) Новосибирск' },
  { value: 'Asia/Irkutsk', content: '(UTC+8) Иркутск' },
  { value: 'Asia/Yakutsk', content: '(UTC+9) Якутск' },
  { value: 'Asia/Vladivostok', content: '(UTC+10) Владивосток' },
  { value: 'Asia/Magadan', content: '(UTC+11) Магадан' },
  { value: 'Asia/Kamchatka', content: '(UTC+12) Камчатка' },
  { value: 'Europe/London', content: '(UTC+0) Лондон' },
  { value: 'Europe/Berlin', content: '(UTC+1) Берлин' },
  { value: 'America/New_York', content: '(UTC−5) Нью-Йорк' },
  { value: 'America/Los_Angeles', content: '(UTC−8) Лос-Анджелес' },
];

const NOTIFICATION_OPTIONS: {key: NotificationKey; label: string; hint: string}[] = [
  { key: 'product', label: 'Новости продукта', hint: 'Новые возможности и обновления' },
  { key: 'alerts', label: 'Системные алерты', hint: 'Важные события безопасности и сбои' },
  { key: 'digest', label: 'Дайджест за неделю', hint: 'Сводка активности раз в неделю' },
];

const DEFAULT_VALUES: ProfileSettingsValues = {
  name: 'Анна Иванова',
  email: 'anna.ivanova@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifications: { product: true, alerts: true, digest: false },
};

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<'name' | 'email', string>>;

function validate(values: ProfileSettingsValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) {
    errors.name = 'Введите имя';
  }
  if (!values.email.trim()) {
    errors.email = 'Введите email';
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Некорректный email';
  }
  return errors;
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="column" gap={1}>
      <Text as="label" variant="subheader-1" htmlFor={htmlFor}>
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export function ProfileSettings({
  initialValues = DEFAULT_VALUES,
  onSave,
  onCancel,
}: ProfileSettingsProps) {
  const [saved, setSaved] = React.useState(initialValues);
  const [values, setValues] = React.useState(initialValues);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'saved' | 'error'>('idle');

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // blob-URL, созданный нами и требующий освобождения
  const objectUrlRef = React.useRef<string | null>(null);

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };
  React.useEffect(() => revokeObjectUrl, []);

  const errors = validate(values);
  const showError = (field: 'name' | 'email') =>
    (touched[field] || submitted) && errors[field] ? errors[field] : undefined;

  const dirty = avatarFile !== null || JSON.stringify(values) !== JSON.stringify(saved);

  const update = <K extends keyof ProfileSettingsValues>(key: K, value: ProfileSettingsValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setStatus('idle');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // позволяет выбрать тот же файл повторно
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Выберите файл изображения (PNG, JPG, GIF, WebP)');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Размер файла не должен превышать 2 МБ');
      return;
    }

    revokeObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setAvatarError(null);
    setAvatarFile(file);
    update('avatarUrl', url);
  };

  const handleAvatarRemove = () => {
    revokeObjectUrl();
    setAvatarError(null);
    setAvatarFile(null);
    update('avatarUrl', null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    const next: ProfileSettingsValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    };
    setSaving(true);
    setStatus('idle');
    try {
      await onSave?.(next, avatarFile);
      setSaved(next);
      setValues(next);
      setAvatarFile(null);
      setSubmitted(false);
      setTouched({});
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // blob-URL от несохранённого файла больше не нужен
    revokeObjectUrl();
    setValues(saved);
    setAvatarFile(null);
    setAvatarError(null);
    setTouched({});
    setSubmitted(false);
    setStatus('idle');
    onCancel?.();
  };

  const avatarInitials = values.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="profile-settings-title">
      <Card view="outlined" type="container" style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
        <Flex direction="column" gap={6}>
          <Text as="h1" variant="header-1" id="profile-settings-title">
            Настройки профиля
          </Text>

          {/* Аватар */}
          <Flex gap={4} alignItems="center" wrap>
            {values.avatarUrl ? (
              <Avatar
                size="xl"
                imgUrl={values.avatarUrl}
                alt="Аватар пользователя"
              />
            ) : (
              <Avatar size="xl" text={avatarInitials} theme="brand" aria-label="Аватар пользователя" />
            )}
            <Flex direction="column" gap={2}>
              <Flex gap={2} wrap>
                <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
                  Загрузить фото
                </Button>
                {values.avatarUrl ? (
                  <Button view="flat-danger" onClick={handleAvatarRemove}>
                    Удалить
                  </Button>
                ) : null}
              </Flex>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
                aria-label="Файл аватара"
              />
              {avatarError ? (
                <Text color="danger" variant="body-1" role="alert">
                  {avatarError}
                </Text>
              ) : (
                <Text color="secondary" variant="body-1">
                  PNG, JPG, GIF или WebP, до 2 МБ
                </Text>
              )}
            </Flex>
          </Flex>

          <Divider />

          {/* Основные поля */}
          <Flex direction="column" gap={4}>
            <Field label="Имя" htmlFor="profile-name">
              <TextInput
                id="profile-name"
                name="name"
                size="l"
                autoComplete="name"
                value={values.name}
                onUpdate={(v) => update('name', v)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                validationState={showError('name') ? 'invalid' : undefined}
                errorMessage={showError('name')}
              />
            </Field>

            <Field label="Email" htmlFor="profile-email">
              <TextInput
                id="profile-email"
                name="email"
                type="email"
                size="l"
                autoComplete="email"
                value={values.email}
                onUpdate={(v) => update('email', v)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                validationState={showError('email') ? 'invalid' : undefined}
                errorMessage={showError('email')}
              />
            </Field>

            <Flex gap={4} wrap>
              <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                <Field label="Язык интерфейса" htmlFor="profile-language">
                  <Select
                    id="profile-language"
                    size="l"
                    width="max"
                    value={[values.language]}
                    options={LANGUAGES}
                    onUpdate={([v]) => v && update('language', v)}
                  />
                </Field>
              </div>
              <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                <Field label="Часовой пояс" htmlFor="profile-timezone">
                  <Select
                    id="profile-timezone"
                    size="l"
                    width="max"
                    filterable
                    filterPlaceholder="Поиск"
                    value={[values.timezone]}
                    options={TIMEZONES}
                    onUpdate={([v]) => v && update('timezone', v)}
                  />
                </Field>
              </div>
            </Flex>
          </Flex>

          <Divider />

          {/* Безопасность */}
          <Flex direction="column" gap={3}>
            <Text as="h2" variant="subheader-3">
              Безопасность
            </Text>
            <Flex justifyContent="space-between" alignItems="center" gap={4}>
              <Flex direction="column" gap={1}>
                <Text as="label" htmlFor="profile-2fa" variant="body-2">
                  Двухфакторная авторизация
                </Text>
                <Text color="secondary" variant="body-1" id="profile-2fa-hint">
                  Дополнительный код при входе в аккаунт
                </Text>
              </Flex>
              <Switch
                id="profile-2fa"
                size="l"
                checked={values.twoFactor}
                onUpdate={(v) => update('twoFactor', v)}
                controlProps={{ 'aria-describedby': 'profile-2fa-hint' }}
              />
            </Flex>
          </Flex>

          <Divider />

          {/* Уведомления */}
          <Flex direction="column" gap={3} as="fieldset" style={{ border: 0, margin: 0, padding: 0 }}>
            <Text as="legend" variant="subheader-3" style={{ padding: 0, marginBottom: 12 }}>
              Email-уведомления
            </Text>
            {NOTIFICATION_OPTIONS.map(({ key, label, hint }) => (
              <Flex key={key} direction="column" gap={1}>
                <Checkbox
                  size="l"
                  checked={values.notifications[key]}
                  onUpdate={(checked) =>
                    update('notifications', { ...values.notifications, [key]: checked })
                  }
                  content={label}
                />
                <Text color="secondary" variant="body-1" style={{ paddingLeft: 28 }}>
                  {hint}
                </Text>
              </Flex>
            ))}
          </Flex>

          <Divider />

          {/* Действия */}
          <Flex justifyContent="space-between" alignItems="center" gap={3} wrap>
            <div aria-live="polite">
              {status === 'saved' ? (
                <Text color="positive" variant="body-2">
                  Изменения сохранены
                </Text>
              ) : null}
              {status === 'error' ? (
                <Text color="danger" variant="body-2">
                  Не удалось сохранить. Попробуйте ещё раз
                </Text>
              ) : null}
            </div>
            <Flex gap={2}>
              <Button view="flat" size="l" onClick={handleCancel} disabled={saving}>
                Отмена
              </Button>
              <Button type="submit" view="action" size="l" loading={saving} disabled={!dirty}>
                Сохранить
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </form>
  );
}
