import * as React from 'react';
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
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: Record<NotificationKey, boolean>;
}

export interface ProfileSettingsProps {
  initialValues?: Partial<ProfileSettingsValues>;
  onSave?: (values: ProfileSettingsValues) => void;
  onCancel?: () => void;
}

const LANGUAGE_OPTIONS = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
  { value: 'tr', content: 'Türkçe' },
  { value: 'kk', content: 'Қазақша' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград' },
  { value: 'Europe/Moscow', content: '(UTC+03:00) Москва, Санкт-Петербург' },
  { value: 'Europe/Samara', content: '(UTC+04:00) Самара' },
  { value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург' },
  { value: 'Asia/Omsk', content: '(UTC+06:00) Омск' },
  { value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск' },
  { value: 'Asia/Irkutsk', content: '(UTC+08:00) Иркутск' },
  { value: 'Asia/Yakutsk', content: '(UTC+09:00) Якутск' },
  { value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток' },
  { value: 'Asia/Magadan', content: '(UTC+11:00) Магадан' },
  { value: 'Asia/Kamchatka', content: '(UTC+12:00) Камчатка' },
  { value: 'Europe/London', content: '(UTC+00:00) Лондон' },
  { value: 'Europe/Berlin', content: '(UTC+01:00) Берлин, Париж' },
  { value: 'Asia/Almaty', content: '(UTC+05:00) Алматы' },
  { value: 'Asia/Tashkent', content: '(UTC+05:00) Ташкент' },
  { value: 'Asia/Tbilisi', content: '(UTC+04:00) Тбилиси' },
  { value: 'Asia/Yerevan', content: '(UTC+04:00) Ереван' },
  { value: 'Asia/Dubai', content: '(UTC+04:00) Дубай' },
  { value: 'Asia/Shanghai', content: '(UTC+08:00) Шанхай' },
  { value: 'Asia/Tokyo', content: '(UTC+09:00) Токио' },
  { value: 'America/New_York', content: '(UTC−05:00) Нью-Йорк' },
  { value: 'America/Los_Angeles', content: '(UTC−08:00) Лос-Анджелес' },
];

const NOTIFICATION_OPTIONS: {
  key: NotificationKey;
  label: string;
  hint: string;
}[] = [
  {
    key: 'productNews',
    label: 'Новости продукта',
    hint: 'Анонсы новых функций и обновлений',
  },
  {
    key: 'systemAlerts',
    label: 'Системные алерты',
    hint: 'Сбои, инциденты и важные уведомления безопасности',
  },
  {
    key: 'weeklyDigest',
    label: 'Дайджест за неделю',
    hint: 'Сводка активности раз в неделю',
  },
];

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2 МБ

const DEFAULT_VALUES: ProfileSettingsValues = {
  name: '',
  email: '',
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const initials = parts.slice(0, 2).map((p) => p[0]!.toUpperCase());
  return initials.join('');
}

function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return 'Укажите email';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Некорректный email';
  return undefined;
}

function validateName(name: string): string | undefined {
  if (!name.trim()) return 'Укажите имя';
  if (name.trim().length > 100) return 'Имя не длиннее 100 символов';
  return undefined;
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}

/** Строка формы: подпись слева, контрол справа. */
function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <Flex gap={4} alignItems="flex-start" wrap>
      <Flex direction="column" width={200} shrink={0} spacing={{ pt: 1 }}>
        <Text
          as="label"
          variant="subheader-1"
          {...(htmlFor ? { htmlFor } : {})}
        >
          {label}
        </Text>
        {hint ? (
          <Text variant="caption-2" color="secondary">
            {hint}
          </Text>
        ) : null}
      </Flex>
      <Flex direction="column" grow basis={0} minWidth={240}>
        {children}
      </Flex>
    </Flex>
  );
}

export function ProfileSettings({
  initialValues,
  onSave,
  onCancel,
}: ProfileSettingsProps) {
  const initial = React.useMemo<ProfileSettingsValues>(
    () => ({
      ...DEFAULT_VALUES,
      ...initialValues,
      notifications: {
        ...DEFAULT_VALUES.notifications,
        ...initialValues?.notifications,
      },
    }),
    [initialValues],
  );

  // Последнее сохранённое состояние: с ним сравниваем изменения, к нему откатывает «Отмена».
  const [baseline, setBaseline] =
    React.useState<ProfileSettingsValues>(initial);
  const [values, setValues] = React.useState<ProfileSettingsValues>(initial);
  const [touched, setTouched] = React.useState<{
    name?: boolean;
    email?: boolean;
  }>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Object URL для ещё не сохранённого локально выбранного файла.
  // Освобождаем при замене, отмене и размонтировании; сохранённый URL не трогаем.
  const pendingObjectUrlRef = React.useRef<string | null>(null);

  const revokePendingObjectUrl = React.useCallback(() => {
    if (pendingObjectUrlRef.current) {
      URL.revokeObjectURL(pendingObjectUrlRef.current);
      pendingObjectUrlRef.current = null;
    }
  }, []);

  React.useEffect(() => revokePendingObjectUrl, [revokePendingObjectUrl]);

  const update = <K extends keyof ProfileSettingsValues>(
    key: K,
    value: ProfileSettingsValues[K],
  ) => {
    setSaved(false);
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key: NotificationKey, checked: boolean) => {
    setSaved(false);
    setValues((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: checked },
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Сбрасываем value, чтобы повторный выбор того же файла снова вызвал onChange.
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError(
        'Можно загрузить только изображение (PNG, JPG, GIF, WebP)',
      );
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Файл слишком большой. Максимальный размер — 2 МБ');
      return;
    }

    revokePendingObjectUrl();
    const url = URL.createObjectURL(file);
    pendingObjectUrlRef.current = url;
    setAvatarError(null);
    update('avatarUrl', url);
  };

  const handleAvatarRemove = () => {
    revokePendingObjectUrl();
    setAvatarError(null);
    update('avatarUrl', null);
  };

  const nameError = validateName(values.name);
  const emailError = validateEmail(values.email);
  const showNameError = (touched.name || submitted) && nameError;
  const showEmailError = (touched.email || submitted) && emailError;
  const isValid = !nameError && !emailError;

  const isDirty = React.useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baseline),
    [values, baseline],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    const result: ProfileSettingsValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    };
    onSave?.(result);
    // Загруженный аватар теперь часть сохранённого состояния — его URL больше не «ожидающий».
    pendingObjectUrlRef.current = null;
    setBaseline(result);
    setValues(result);
    setTouched({});
    setSubmitted(false);
    setSaved(true);
  };

  const handleCancel = () => {
    revokePendingObjectUrl();
    setValues(baseline);
    setTouched({});
    setSubmitted(false);
    setAvatarError(null);
    setSaved(false);
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 760 }}>
      <Flex direction="column" gap={6}>
        <Flex direction="column" gap={1}>
          <Text as="h1" variant="header-2">
            Настройки профиля
          </Text>
          <Text variant="body-1" color="secondary">
            Личные данные, язык, часовой пояс, безопасность и уведомления
          </Text>
        </Flex>

        {/* Личные данные */}
        <Card view="outlined" type="container" spacing={{ p: 5 }}>
          <Flex direction="column" gap={5}>
            <Text as="h2" variant="subheader-3">
              Личные данные
            </Text>

            <Field label="Аватар" hint="PNG, JPG, GIF или WebP до 2 МБ">
              <Flex gap={4} alignItems="center" wrap>
                {values.avatarUrl ? (
                  <Avatar
                    size="xl"
                    imgUrl={values.avatarUrl}
                    alt="Аватар пользователя"
                  />
                ) : (
                  <Avatar
                    size="xl"
                    text={getInitials(values.name)}
                    theme="brand"
                  />
                )}
                <Flex gap={2} wrap>
                  <Button
                    view="outlined"
                    size="m"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {values.avatarUrl ? 'Заменить' : 'Загрузить'}
                  </Button>
                  {values.avatarUrl ? (
                    <Button
                      view="flat-danger"
                      size="m"
                      onClick={handleAvatarRemove}
                    >
                      Удалить
                    </Button>
                  ) : null}
                </Flex>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  aria-label="Загрузить аватар"
                  style={{ display: 'none' }}
                />
              </Flex>
              {avatarError ? (
                <Text variant="body-1" color="danger" style={{ marginTop: 8 }}>
                  {avatarError}
                </Text>
              ) : null}
            </Field>

            <Field label="Имя" htmlFor="profile-name">
              <TextInput
                id="profile-name"
                name="name"
                size="l"
                value={values.name}
                placeholder="Иван Иванов"
                autoComplete="name"
                hasClear
                onUpdate={(v) => update('name', v)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                validationState={showNameError ? 'invalid' : undefined}
                errorMessage={showNameError ? nameError : undefined}
                errorPlacement="outside"
              />
            </Field>

            <Field label="Email" htmlFor="profile-email">
              <TextInput
                id="profile-email"
                name="email"
                type="email"
                size="l"
                value={values.email}
                placeholder="you@example.com"
                autoComplete="email"
                hasClear
                onUpdate={(v) => update('email', v)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                validationState={showEmailError ? 'invalid' : undefined}
                errorMessage={showEmailError ? emailError : undefined}
                errorPlacement="outside"
              />
            </Field>
          </Flex>
        </Card>

        {/* Локализация */}
        <Card view="outlined" type="container" spacing={{ p: 5 }}>
          <Flex direction="column" gap={5}>
            <Text as="h2" variant="subheader-3">
              Язык и регион
            </Text>

            <Field label="Язык интерфейса" htmlFor="profile-language">
              <Select
                id="profile-language"
                name="language"
                size="l"
                width="max"
                value={[values.language]}
                options={LANGUAGE_OPTIONS}
                onUpdate={([v]) => v && update('language', v)}
                aria-label="Язык интерфейса"
              />
            </Field>

            <Field
              label="Часовой пояс"
              htmlFor="profile-timezone"
              hint="Используется для дат и расписаний"
            >
              <Select
                id="profile-timezone"
                name="timezone"
                size="l"
                width="max"
                filterable
                filterPlaceholder="Поиск города или смещения"
                value={[values.timezone]}
                options={TIMEZONE_OPTIONS}
                onUpdate={([v]) => v && update('timezone', v)}
                aria-label="Часовой пояс"
              />
            </Field>
          </Flex>
        </Card>

        {/* Безопасность */}
        <Card view="outlined" type="container" spacing={{ p: 5 }}>
          <Flex direction="column" gap={5}>
            <Text as="h2" variant="subheader-3">
              Безопасность
            </Text>

            <Field
              label="Двухфакторная авторизация"
              hint="Код подтверждения при каждом входе"
            >
              <Switch
                size="l"
                name="twoFactorEnabled"
                checked={values.twoFactorEnabled}
                onUpdate={(checked) => update('twoFactorEnabled', checked)}
                content={values.twoFactorEnabled ? 'Включена' : 'Выключена'}
              />
            </Field>
          </Flex>
        </Card>

        {/* Уведомления */}
        <Card view="outlined" type="container" spacing={{ p: 5 }}>
          <Flex direction="column" gap={5}>
            <Text as="h2" variant="subheader-3">
              Email-уведомления
            </Text>

            <Field
              label="Присылать на email"
              hint={values.email.trim() || 'Укажите email выше'}
            >
              <Flex
                direction="column"
                gap={3}
                role="group"
                aria-label="Email-уведомления"
              >
                {NOTIFICATION_OPTIONS.map(({ key, label, hint }) => (
                  <Checkbox
                    key={key}
                    size="l"
                    name={`notifications.${key}`}
                    checked={values.notifications[key]}
                    onUpdate={(checked) => updateNotification(key, checked)}
                  >
                    <Flex direction="column">
                      <Text variant="body-1">{label}</Text>
                      <Text variant="caption-2" color="secondary">
                        {hint}
                      </Text>
                    </Flex>
                  </Checkbox>
                ))}
              </Flex>
            </Field>
          </Flex>
        </Card>

        <Divider />

        {/* Действия */}
        <Flex gap={3} alignItems="center" wrap>
          <Button type="submit" view="action" size="l" disabled={!isDirty}>
            Сохранить
          </Button>
          <Button
            type="button"
            view="flat"
            size="l"
            onClick={handleCancel}
            disabled={!isDirty}
          >
            Отмена
          </Button>
          {saved && !isDirty ? (
            <Text variant="body-1" color="positive" role="status">
              Изменения сохранены
            </Text>
          ) : null}
          {submitted && !isValid ? (
            <Text variant="body-1" color="danger" role="alert">
              Исправьте ошибки в форме
            </Text>
          ) : null}
        </Flex>
      </Flex>
    </form>
  );
}
