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

export type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export interface ProfileSettingsValues {
  name: string;
  email: string;
  /** URL аватара (blob:/https:) или null, если аватар не задан */
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: Record<NotificationKey, boolean>;
}

export interface ProfileSettingsProps {
  initialValues?: ProfileSettingsValues;
  /** Вызывается при сохранении валидной формы. Может быть асинхронной. */
  onSave?: (values: ProfileSettingsValues, avatarFile: File | null) => void | Promise<void>;
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
  { value: 'UTC', content: '(UTC+00:00) UTC' },
  { value: 'Europe/London', content: '(UTC+00:00) Лондон' },
  { value: 'Europe/Berlin', content: '(UTC+01:00) Берлин' },
  { value: 'Europe/Istanbul', content: '(UTC+03:00) Стамбул' },
  { value: 'Asia/Dubai', content: '(UTC+04:00) Дубай' },
  { value: 'Asia/Tashkent', content: '(UTC+05:00) Ташкент' },
  { value: 'Asia/Almaty', content: '(UTC+05:00) Алматы' },
  { value: 'Asia/Kolkata', content: '(UTC+05:30) Нью-Дели' },
  { value: 'Asia/Shanghai', content: '(UTC+08:00) Пекин' },
  { value: 'Asia/Tokyo', content: '(UTC+09:00) Токио' },
  { value: 'America/New_York', content: '(UTC−05:00) Нью-Йорк' },
  { value: 'America/Chicago', content: '(UTC−06:00) Чикаго' },
  { value: 'America/Los_Angeles', content: '(UTC−08:00) Лос-Анджелес' },
];

const NOTIFICATION_OPTIONS: {key: NotificationKey; title: string; description: string}[] = [
  {
    key: 'productNews',
    title: 'Новости продукта',
    description: 'Новые функции, улучшения и обновления сервиса',
  },
  {
    key: 'systemAlerts',
    title: 'Системные алерты',
    description: 'Важные уведомления о безопасности и работе аккаунта',
  },
  {
    key: 'weeklyDigest',
    title: 'Дайджест за неделю',
    description: 'Сводка активности раз в неделю',
  },
];

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_VALUES: ProfileSettingsValues = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifications: {productNews: true, systemAlerts: true, weeklyDigest: false},
};

interface Errors {
  name?: string;
  email?: string;
  avatar?: string;
}

function validate(values: ProfileSettingsValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Введите имя';
  const email = values.email.trim();
  if (!email) errors.email = 'Введите email';
  else if (!EMAIL_RE.test(email)) errors.email = 'Некорректный email';
  return errors;
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="column" gap={1}>
      <Text as="label" htmlFor={htmlFor} variant="subheader-1">
        {label}
      </Text>
      {children}
      {hint ? (
        <Text variant="caption-2" color="secondary">
          {hint}
        </Text>
      ) : null}
    </Flex>
  );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Flex direction="column" gap={4}>
      <Text variant="header-1" as="h2" style={{margin: 0}}>
        {title}
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
  const [avatarError, setAvatarError] = React.useState<string | undefined>();
  const [submitted, setSubmitted] = React.useState(false);
  const [touched, setTouched] = React.useState<{name?: boolean; email?: boolean}>({});
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | undefined>();
  const [justSaved, setJustSaved] = React.useState(false);

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
    (submitted || touched[field]) && errors[field] ? errors[field] : undefined;

  const isDirty =
    JSON.stringify(values) !== JSON.stringify(saved) || avatarFile !== null;

  const patch = (next: Partial<ProfileSettingsValues>) => {
    setJustSaved(false);
    setValues((prev) => ({...prev, ...next}));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // позволяет выбрать тот же файл повторно
    event.target.value = '';
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Поддерживаются PNG, JPEG, WebP и GIF');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError('Размер файла не должен превышать 5 МБ');
      return;
    }
    setAvatarError(undefined);
    revokeObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setAvatarFile(file);
    patch({avatarUrl: url});
  };

  const handleAvatarRemove = () => {
    revokeObjectUrl();
    setAvatarFile(null);
    setAvatarError(undefined);
    patch({avatarUrl: null});
  };

  const resetForm = () => {
    revokeObjectUrl();
    setValues(saved);
    setAvatarFile(null);
    setAvatarError(undefined);
    setSubmitted(false);
    setTouched({});
    setSaveError(undefined);
    setJustSaved(false);
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || saving) return;

    const next = {...values, name: values.name.trim(), email: values.email.trim()};
    setSaving(true);
    setSaveError(undefined);
    try {
      await onSave?.(next, avatarFile);
      // blob-URL остаётся актуальным превью, поэтому не освобождаем его
      setSaved(next);
      setValues(next);
      setAvatarFile(null);
      setSubmitted(false);
      setTouched({});
      setJustSaved(true);
    } catch {
      setSaveError('Не удалось сохранить настройки. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Настройки профиля">
      <Card
        view="outlined"
        type="container"
        style={{maxWidth: 640, margin: '0 auto', padding: 24}}
      >
        <Flex direction="column" gap={6}>
          <Text variant="display-1" as="h1" style={{margin: 0}}>
            Настройки профиля
          </Text>

          <Section title="Профиль">
            <Flex gap={4} alignItems="center" wrap>
              <Avatar
                size="xl"
                text={values.name.trim() || '?'}
                imgUrl={values.avatarUrl ?? undefined}
                title={values.name}
              />
              <Flex direction="column" gap={2}>
                <Flex gap={2} wrap>
                  <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
                    {values.avatarUrl ? 'Заменить' : 'Загрузить'}
                  </Button>
                  {values.avatarUrl ? (
                    <Button view="flat-danger" onClick={handleAvatarRemove}>
                      Удалить
                    </Button>
                  ) : null}
                </Flex>
                <Text variant="caption-2" color={avatarError ? 'danger' : 'secondary'}>
                  {avatarError ?? 'PNG, JPEG, WebP или GIF, до 5 МБ'}
                </Text>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={AVATAR_TYPES.join(',')}
                  onChange={handleFileChange}
                  hidden
                  aria-label="Загрузить аватар"
                  data-testid="avatar-input"
                />
              </Flex>
            </Flex>

            <Field label="Имя" htmlFor="profile-name">
              <TextInput
                id="profile-name"
                name="name"
                size="l"
                autoComplete="name"
                value={values.name}
                onUpdate={(name) => patch({name})}
                onBlur={() => setTouched((t) => ({...t, name: true}))}
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
                onUpdate={(email) => patch({email})}
                onBlur={() => setTouched((t) => ({...t, email: true}))}
                validationState={showError('email') ? 'invalid' : undefined}
                errorMessage={showError('email')}
              />
            </Field>
          </Section>

          <Divider />

          <Section title="Региональные настройки">
            <Field label="Язык интерфейса" htmlFor="profile-language">
              <Select
                id="profile-language"
                name="language"
                size="l"
                width="max"
                options={LANGUAGES}
                value={[values.language]}
                onUpdate={([language]) => language && patch({language})}
              />
            </Field>

            <Field label="Часовой пояс" htmlFor="profile-timezone">
              <Select
                id="profile-timezone"
                name="timezone"
                size="l"
                width="max"
                filterable
                filterPlaceholder="Поиск часового пояса"
                options={TIMEZONES}
                value={[values.timezone]}
                onUpdate={([timezone]) => timezone && patch({timezone})}
              />
            </Field>
          </Section>

          <Divider />

          <Section title="Безопасность">
            <Flex justifyContent="space-between" alignItems="center" gap={4}>
              <Flex direction="column" gap={1}>
                <Text variant="subheader-1" id="two-factor-label">
                  Двухфакторная авторизация
                </Text>
                <Text variant="body-1" color="secondary">
                  Запрашивать код подтверждения при входе в аккаунт
                </Text>
              </Flex>
              <Switch
                size="l"
                checked={values.twoFactor}
                onUpdate={(twoFactor) => patch({twoFactor})}
                controlProps={{'aria-labelledby': 'two-factor-label'}}
              />
            </Flex>
          </Section>

          <Divider />

          <Section title="Email-уведомления">
            <Flex direction="column" gap={3} role="group" aria-label="Email-уведомления">
              {NOTIFICATION_OPTIONS.map(({key, title, description}) => (
                <Checkbox
                  key={key}
                  size="l"
                  checked={values.notifications[key]}
                  onUpdate={(checked) =>
                    patch({notifications: {...values.notifications, [key]: checked}})
                  }
                >
                  <Flex direction="column">
                    <Text variant="body-2">{title}</Text>
                    <Text variant="caption-2" color="secondary">
                      {description}
                    </Text>
                  </Flex>
                </Checkbox>
              ))}
            </Flex>
          </Section>

          <Divider />

          <Flex direction="column" gap={3}>
            {saveError ? (
              <Text color="danger" role="alert">
                {saveError}
              </Text>
            ) : null}
            {justSaved ? (
              <Text color="positive" role="status">
                Настройки сохранены
              </Text>
            ) : null}
            <Flex gap={2} justifyContent="flex-end">
              <Button
                view="flat"
                size="l"
                type="button"
                onClick={handleCancel}
                disabled={saving || (!isDirty && !saveError)}
              >
                Отмена
              </Button>
              <Button
                view="action"
                size="l"
                type="submit"
                loading={saving}
                disabled={!isDirty}
              >
                Сохранить
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </form>
  );
}
