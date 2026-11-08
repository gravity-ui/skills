import React from 'react';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

export type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export interface ProfileSettingsValues {
  name: string;
  email: string;
  /** URL аватара (http(s) или blob:) либо null, если аватара нет */
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: Record<NotificationKey, boolean>;
}

export interface ProfileSettingsProps {
  initialValues?: ProfileSettingsValues;
  /** Должен вернуть промис; при reject форма покажет ошибку. */
  onSave?: (values: ProfileSettingsValues, avatarFile: File | null) => Promise<void>;
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
  { value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград' },
  { value: 'Europe/Moscow', content: '(UTC+03:00) Москва' },
  { value: 'Europe/Samara', content: '(UTC+04:00) Самара' },
  { value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург' },
  { value: 'Asia/Omsk', content: '(UTC+06:00) Омск' },
  { value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск' },
  { value: 'Asia/Irkutsk', content: '(UTC+08:00) Иркутск' },
  { value: 'Asia/Yakutsk', content: '(UTC+09:00) Якутск' },
  { value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток' },
  { value: 'Asia/Kamchatka', content: '(UTC+12:00) Камчатка' },
  { value: 'Europe/London', content: '(UTC+00:00) Лондон' },
  { value: 'Europe/Berlin', content: '(UTC+01:00) Берлин' },
  { value: 'America/New_York', content: '(UTC−05:00) Нью-Йорк' },
  { value: 'America/Los_Angeles', content: '(UTC−08:00) Лос-Анджелес' },
];

const NOTIFICATIONS: {key: NotificationKey; label: string}[] = [
  { key: 'productNews', label: 'Новости продукта' },
  { key: 'systemAlerts', label: 'Системные алерты' },
  { key: 'weeklyDigest', label: 'Дайджест за неделю' },
];

const DEFAULT_VALUES: ProfileSettingsValues = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifications: { productNews: true, systemAlerts: true, weeklyDigest: false },
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<'name' | 'email' | 'avatar', string>>;

function validate(values: ProfileSettingsValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Введите имя';
  if (!values.email.trim()) errors.email = 'Введите email';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Некорректный email';
  return errors;
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="column" gap={1}>
      <Text as="label" variant="subheader-1" htmlFor={htmlFor}>
        {label}
      </Text>
      {children}
      {error ? (
        <Text color="danger" variant="body-1" role="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text color="secondary" variant="body-1">
          {hint}
        </Text>
      ) : null}
    </Flex>
  );
}

export function ProfileSettings({
  initialValues = DEFAULT_VALUES,
  onSave,
  onCancel,
}: ProfileSettingsProps) {
  // «Сохранённое» состояние: к нему возвращает «Отмена», от него считается dirty.
  const [saved, setSaved] = React.useState(initialValues);
  const [values, setValues] = React.useState(initialValues);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [touched, setTouched] = React.useState<Partial<Record<'name' | 'email', boolean>>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState<string>();
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<{type: 'success' | 'error'; text: string}>();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // blob-URL'ы, созданные этим компонентом, — чтобы освобождать память.
  const blobUrls = React.useRef(new Set<string>());

  const revokeUnused = (keep: Array<string | null>) => {
    blobUrls.current.forEach((url) => {
      if (!keep.includes(url)) {
        URL.revokeObjectURL(url);
        blobUrls.current.delete(url);
      }
    });
  };

  React.useEffect(() => {
    const urls = blobUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const set = <K extends keyof ProfileSettingsValues>(key: K, value: ProfileSettingsValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setStatus(undefined);
  };

  const errors = validate(values);
  const showError = (key: 'name' | 'email') =>
    touched[key] || submitted ? errors[key] : undefined;

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // позволяет выбрать тот же файл повторно
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Выберите файл изображения (PNG, JPG, WebP…)');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Файл слишком большой — максимум 2 МБ');
      return;
    }
    setAvatarError(undefined);
    const url = URL.createObjectURL(file);
    blobUrls.current.add(url);
    setAvatarFile(file);
    set('avatarUrl', url);
  };

  const removeAvatar = () => {
    setAvatarError(undefined);
    setAvatarFile(null);
    set('avatarUrl', null);
  };

  const handleCancel = () => {
    setValues(saved);
    setAvatarFile(null);
    setAvatarError(undefined);
    setTouched({});
    setSubmitted(false);
    setStatus(undefined);
    revokeUnused([saved.avatarUrl]);
    onCancel?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    const next = { ...values, name: values.name.trim(), email: values.email.trim() };
    setSaving(true);
    setStatus(undefined);
    try {
      await onSave?.(next, avatarFile);
      setSaved(next);
      setValues(next);
      setAvatarFile(null);
      setSubmitted(false);
      setTouched({});
      revokeUnused([next.avatarUrl]);
      setStatus({ type: 'success', text: 'Изменения сохранены' });
    } catch {
      setStatus({ type: 'error', text: 'Не удалось сохранить. Попробуйте ещё раз.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card view="outlined" type="container" style={{ maxWidth: 640, width: '100%', padding: 24 }}>
      <form onSubmit={handleSubmit} noValidate aria-label="Настройки профиля">
        <Flex direction="column" gap={5}>
          <Text as="h1" variant="header-2" style={{ margin: 0 }}>
            Настройки профиля
          </Text>

          {/* Аватар */}
          <Flex gap={4} alignItems="center">
            {values.avatarUrl ? (
              <Avatar size="xl" imgUrl={values.avatarUrl} alt="Аватар" />
            ) : (
              <Avatar size="xl" text={initials(values.name)} theme="brand" />
            )}
            <Flex direction="column" gap={2}>
              <Flex gap={2}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  hidden
                  data-testid="avatar-input"
                  aria-label="Файл аватара"
                />
                <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
                  {values.avatarUrl ? 'Заменить' : 'Загрузить'}
                </Button>
                {values.avatarUrl && (
                  <Button view="flat" onClick={removeAvatar}>
                    Удалить
                  </Button>
                )}
              </Flex>
              {avatarError ? (
                <Text color="danger" role="alert">
                  {avatarError}
                </Text>
              ) : (
                <Text color="secondary">PNG, JPG или WebP, до 2 МБ</Text>
              )}
            </Flex>
          </Flex>

          <Field label="Имя" htmlFor="profile-name" error={showError('name')}>
            <TextInput
              id="profile-name"
              name="name"
              size="l"
              value={values.name}
              onUpdate={(v) => set('name', v)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              validationState={showError('name') ? 'invalid' : undefined}
              autoComplete="name"
            />
          </Field>

          <Field label="Email" htmlFor="profile-email" error={showError('email')}>
            <TextInput
              id="profile-email"
              name="email"
              type="email"
              size="l"
              value={values.email}
              onUpdate={(v) => set('email', v)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              validationState={showError('email') ? 'invalid' : undefined}
              autoComplete="email"
            />
          </Field>

          <Flex gap={4} wrap>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <Field label="Язык интерфейса" htmlFor="profile-language">
                <Select
                  id="profile-language"
                  name="language"
                  size="l"
                  width="max"
                  value={[values.language]}
                  options={LANGUAGES}
                  onUpdate={([v]) => v && set('language', v)}
                />
              </Field>
            </div>
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <Field label="Часовой пояс" htmlFor="profile-timezone">
                <Select
                  id="profile-timezone"
                  name="timezone"
                  size="l"
                  width="max"
                  filterable
                  filterPlaceholder="Поиск"
                  value={[values.timezone]}
                  options={TIMEZONES}
                  onUpdate={([v]) => v && set('timezone', v)}
                />
              </Field>
            </div>
          </Flex>

          {/* Безопасность */}
          <Flex justifyContent="space-between" alignItems="center" gap={4}>
            <Flex direction="column" gap={1}>
              <Text as="label" variant="subheader-1" htmlFor="profile-2fa">
                Двухфакторная авторизация
              </Text>
              <Text color="secondary">Дополнительный код при входе повышает защиту аккаунта</Text>
            </Flex>
            <Switch
              id="profile-2fa"
              size="l"
              checked={values.twoFactor}
              onUpdate={(v) => set('twoFactor', v)}
            />
          </Flex>

          {/* Уведомления */}
          <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
            <Text as="legend" variant="subheader-1" style={{ padding: 0, marginBottom: 8 }}>
              Email-уведомления
            </Text>
            <Flex direction="column" gap={2}>
              {NOTIFICATIONS.map(({ key, label }) => (
                <Checkbox
                  key={key}
                  size="l"
                  content={label}
                  checked={values.notifications[key]}
                  onUpdate={(checked) =>
                    set('notifications', { ...values.notifications, [key]: checked })
                  }
                />
              ))}
            </Flex>
          </fieldset>

          {/* Действия */}
          <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
            <div aria-live="polite">
              {status && (
                <Text color={status.type === 'success' ? 'positive' : 'danger'}>
                  {status.text}
                </Text>
              )}
            </div>
            <Flex gap={2}>
              <Button view="flat" size="l" onClick={handleCancel} disabled={saving}>
                Отмена
              </Button>
              <Button
                view="action"
                size="l"
                type="submit"
                loading={saving}
                disabled={!dirty}
              >
                Сохранить
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
}
