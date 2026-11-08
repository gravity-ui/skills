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
  /** URL текущего аватара (или object URL для только что выбранного файла) */
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: Record<NotificationKey, boolean>;
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
  { value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск' },
  { value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток' },
  { value: 'Europe/London', content: '(UTC+00:00) Лондон' },
  { value: 'Europe/Berlin', content: '(UTC+01:00) Берлин' },
  { value: 'America/New_York', content: '(UTC−05:00) Нью-Йорк' },
  { value: 'America/Los_Angeles', content: '(UTC−08:00) Лос-Анджелес' },
];

const NOTIFICATION_OPTIONS: {key: NotificationKey; label: string; hint: string}[] = [
  {key: 'productNews', label: 'Новости продукта', hint: 'Новые функции и обновления сервиса'},
  {key: 'systemAlerts', label: 'Системные алерты', hint: 'Безопасность аккаунта и важные уведомления'},
  {key: 'weeklyDigest', label: 'Дайджест за неделю', hint: 'Сводка активности раз в неделю'},
];

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_VALUES: ProfileSettingsValues = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
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
  if (!values.name.trim()) {
    errors.name = 'Укажите имя';
  }
  if (!values.email.trim()) {
    errors.email = 'Укажите email';
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Введите корректный email';
  }
  return errors;
}

function isEqual(
  a: ProfileSettingsValues,
  b: ProfileSettingsValues,
  aFile: File | null,
  bFile: File | null,
) {
  return (
    aFile === bFile &&
    a.name === b.name &&
    a.email === b.email &&
    a.avatarUrl === b.avatarUrl &&
    a.language === b.language &&
    a.timezone === b.timezone &&
    a.twoFactor === b.twoFactor &&
    NOTIFICATION_OPTIONS.every(({key}) => a.notifications[key] === b.notifications[key])
  );
}

interface FieldProps {
  label: string;
  labelId: string;
  children: React.ReactNode;
}

function Field({label, labelId, children}: FieldProps) {
  return (
    <Flex direction="column" gap={1}>
      <Text id={labelId} variant="subheader-1">
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export interface ProfileSettingsProps {
  initialValues?: ProfileSettingsValues;
  /** Отправка на сервер. Аватар передаётся отдельно как File, если был выбран новый. */
  onSave?: (values: ProfileSettingsValues, avatarFile: File | null) => Promise<void> | void;
  onCancel?: () => void;
}

export function ProfileSettings({
  initialValues = DEFAULT_VALUES,
  onSave,
  onCancel,
}: ProfileSettingsProps) {
  const [saved, setSaved] = React.useState(initialValues);
  const [values, setValues] = React.useState(initialValues);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [savedFile, setSavedFile] = React.useState<File | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | undefined>();
  const [touched, setTouched] = React.useState<{name?: boolean; email?: boolean}>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | undefined>();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // object URL живёт, пока выбран файл; освобождаем при смене/размонтировании
  const previewUrl = React.useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile],
  );
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const avatarSrc = previewUrl ?? values.avatarUrl;
  const errors = validate(values);
  const showNameError = (touched.name || submitted) && errors.name;
  const showEmailError = (touched.email || submitted) && errors.email;
  const dirty = !isEqual(values, saved, avatarFile, savedFile);

  const patch = (part: Partial<ProfileSettingsValues>) => {
    setJustSaved(false);
    setValues((prev) => ({...prev, ...part}));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // позволяет выбрать тот же файл повторно
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Выберите файл изображения (PNG, JPG, WebP)');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Размер файла не должен превышать 2 МБ');
      return;
    }
    setAvatarError(undefined);
    setJustSaved(false);
    setAvatarFile(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarError(undefined);
    setAvatarFile(null);
    patch({avatarUrl: null});
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
    setSaveError(undefined);
    try {
      await onSave?.(next, avatarFile);
      setSaved(next);
      setValues(next);
      setSavedFile(avatarFile); // файл остаётся источником превью, пока сервер не вернёт URL
      setSubmitted(false);
      setTouched({});
      setJustSaved(true);
    } catch {
      setSaveError('Не удалось сохранить настройки. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValues(saved);
    setAvatarFile(savedFile);
    setAvatarError(undefined);
    setTouched({});
    setSubmitted(false);
    setSaveError(undefined);
    setJustSaved(false);
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="profile-title">
      <Card view="outlined" type="container" style={{maxWidth: 640, margin: '0 auto', padding: 24}}>
        <Flex direction="column" gap={5}>
          <Text as="h1" variant="header-1" id="profile-title">
            Настройки профиля
          </Text>

          {/* Аватар */}
          <Flex gap={4} alignItems="center">
            <Avatar
              size="xl"
              imgUrl={avatarSrc ?? undefined}
              text={values.name.trim() || '?'}
              title={values.name}
            />
            <Flex direction="column" gap={2}>
              <Flex gap={2}>
                <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
                  {avatarSrc ? 'Заменить' : 'Загрузить фото'}
                </Button>
                {avatarSrc && (
                  <Button view="flat-danger" onClick={handleRemoveAvatar}>
                    Удалить
                  </Button>
                )}
              </Flex>
              <Text variant="body-1" color={avatarError ? 'danger' : 'secondary'} role={avatarError ? 'alert' : undefined}>
                {avatarError ?? 'PNG, JPG или WebP, до 2 МБ'}
              </Text>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
                aria-label="Загрузить аватар"
              />
            </Flex>
          </Flex>

          <Divider />

          {/* Основные данные */}
          <Flex direction="column" gap={4}>
            <Field label="Имя" labelId="profile-name-label">
              <TextInput
                size="l"
                value={values.name}
                onUpdate={(name) => patch({name})}
                onBlur={() => setTouched((t) => ({...t, name: true}))}
                placeholder="Как к вам обращаться"
                autoComplete="name"
                validationState={showNameError ? 'invalid' : undefined}
                errorMessage={showNameError || undefined}
                controlProps={{'aria-labelledby': 'profile-name-label'}}
              />
            </Field>

            <Field label="Email" labelId="profile-email-label">
              <TextInput
                size="l"
                type="email"
                value={values.email}
                onUpdate={(email) => patch({email})}
                onBlur={() => setTouched((t) => ({...t, email: true}))}
                placeholder="name@example.com"
                autoComplete="email"
                validationState={showEmailError ? 'invalid' : undefined}
                errorMessage={showEmailError || undefined}
                controlProps={{'aria-labelledby': 'profile-email-label'}}
              />
            </Field>

            <Flex gap={4} wrap>
              <div style={{flex: '1 1 240px'}}>
                <Field label="Язык интерфейса" labelId="profile-language-label">
                  <Select
                    size="l"
                    width="max"
                    value={[values.language]}
                    onUpdate={([language]) => language && patch({language})}
                    options={LANGUAGES}
                    aria-labelledby="profile-language-label"
                  />
                </Field>
              </div>
              <div style={{flex: '1 1 240px'}}>
                <Field label="Часовой пояс" labelId="profile-timezone-label">
                  <Select
                    size="l"
                    width="max"
                    filterable
                    filterPlaceholder="Поиск"
                    value={[values.timezone]}
                    onUpdate={([timezone]) => timezone && patch({timezone})}
                    options={TIMEZONES}
                    aria-labelledby="profile-timezone-label"
                  />
                </Field>
              </div>
            </Flex>
          </Flex>

          <Divider />

          {/* Безопасность */}
          <Flex direction="column" gap={2}>
            <Text as="h2" variant="subheader-2">
              Безопасность
            </Text>
            <Switch
              size="l"
              checked={values.twoFactor}
              onUpdate={(twoFactor) => patch({twoFactor})}
              content="Двухфакторная авторизация"
            />
            <Text variant="body-1" color="secondary">
              Запрашивать одноразовый код при входе в аккаунт
            </Text>
          </Flex>

          <Divider />

          {/* Уведомления */}
          <Flex direction="column" gap={3} as="fieldset" style={{border: 0, padding: 0, margin: 0}}>
            <Text as="legend" variant="subheader-2" style={{padding: 0, marginBottom: 12}}>
              Email-уведомления
            </Text>
            {NOTIFICATION_OPTIONS.map(({key, label, hint}) => (
              <Flex key={key} direction="column">
                <Checkbox
                  size="l"
                  checked={values.notifications[key]}
                  onUpdate={(checked) =>
                    patch({notifications: {...values.notifications, [key]: checked}})
                  }
                  content={label}
                />
                <Text variant="body-1" color="secondary" style={{marginLeft: 28}}>
                  {hint}
                </Text>
              </Flex>
            ))}
          </Flex>

          {saveError && (
            <Text color="danger" role="alert">
              {saveError}
            </Text>
          )}
          {justSaved && (
            <Text color="positive" role="status">
              Настройки сохранены
            </Text>
          )}

          <Divider />

          <Flex gap={2} justifyContent="flex-end">
            <Button view="flat" size="l" type="button" onClick={handleCancel} disabled={saving || !dirty}>
              Отмена
            </Button>
            <Button view="action" size="l" type="submit" loading={saving} disabled={!dirty}>
              Сохранить
            </Button>
          </Flex>
        </Flex>
      </Card>
    </form>
  );
}
