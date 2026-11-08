import * as React from 'react';
import {
  Avatar,
  Button,
  Checkbox,
  Divider,
  Flex,
  Icon,
  spacing,
  Select,
  Switch,
  Text,
  TextInput,
  useToaster,
} from '@gravity-ui/uikit';
import {ArrowUpFromLine, Person, TrashBin} from '@gravity-ui/icons';

import {LANGUAGE_OPTIONS, TIMEZONE_OPTIONS} from './profileOptions';

import './ProfileSettingsPage.css';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = 'image/png,image/jpeg,image/webp';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailNotifications {
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
}

export interface ProfileSettings {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: EmailNotifications;
}

export interface ProfileSettingsPageProps {
  initialValues?: ProfileSettings;
  onSave?: (values: ProfileSettings, avatarFile: File | null) => Promise<void> | void;
  onCancel?: () => void;
}

const DEFAULT_VALUES: ProfileSettings = {
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

interface FieldErrors {
  name?: string;
  email?: string;
}

function validate(values: ProfileSettings): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) {
    errors.name = 'Укажите имя';
  }
  if (!values.email.trim()) {
    errors.email = 'Укажите email';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Некорректный формат email';
  }
  return errors;
}

interface FieldProps {
  id?: string;
  label: string;
  hint?: string;
  inline?: boolean;
  children: React.ReactNode;
}

function Field({id, label, hint, inline, children}: FieldProps) {
  const labelClassName = inline
    ? 'profile-settings__field-label profile-settings__field-label_inline'
    : 'profile-settings__field-label';
  return (
    <div className="profile-settings__field">
      <div className={labelClassName}>
        {id ? (
          <Text as="label" htmlFor={id} variant="body-2">
            {label}
          </Text>
        ) : (
          <Text variant="body-2">{label}</Text>
        )}
        {hint ? (
          <Text as="div" variant="body-1" color="secondary">
            {hint}
          </Text>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Flex direction="column" gap={4}>
      <Text as="h2" variant="subheader-3">
        {title}
      </Text>
      {children}
    </Flex>
  );
}

export function ProfileSettingsPage({
  initialValues = DEFAULT_VALUES,
  onSave,
  onCancel,
}: ProfileSettingsPageProps) {
  const {add} = useToaster();

  const [values, setValues] = React.useState<ProfileSettings>(initialValues);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(
    initialValues.avatarUrl,
  );
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [touched, setTouched] = React.useState<{name?: boolean; email?: boolean}>({});
  const [saving, setSaving] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const objectUrlRef = React.useRef<string | null>(null);

  const releaseObjectUrl = React.useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  React.useEffect(() => releaseObjectUrl, [releaseObjectUrl]);

  const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setValues((prev) => {
      const next = {...prev, [key]: value};
      if (key === 'name' || key === 'email') {
        setErrors(validate(next));
      }
      return next;
    });
  };

  const updateNotification = (key: keyof EmailNotifications, checked: boolean) => {
    setValues((prev) => ({
      ...prev,
      notifications: {...prev.notifications, [key]: checked},
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarError('Можно загрузить только изображение (PNG, JPEG или WebP)');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError('Файл слишком большой. Максимальный размер — 5 МБ');
      return;
    }
    releaseObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setAvatarFile(file);
    setAvatarPreview(url);
    setAvatarError(null);
  };

  const handleAvatarRemove = () => {
    releaseObjectUrl();
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError(null);
    update('avatarUrl', null);
  };

  const handleSave = async () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({name: true, email: true});
    if (nextErrors.name || nextErrors.email) {
      return;
    }
    setSaving(true);
    try {
      const payload: ProfileSettings = {
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        avatarUrl: avatarPreview,
      };
      await onSave?.(payload, avatarFile);
      add({
        name: 'profile-settings-saved',
        title: 'Настройки сохранены',
        theme: 'success',
        autoHiding: 4000,
      });
    } catch (error) {
      add({
        name: 'profile-settings-error',
        title: 'Не удалось сохранить настройки',
        content: error instanceof Error ? error.message : 'Попробуйте ещё раз',
        theme: 'danger',
        autoHiding: false,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    releaseObjectUrl();
    setValues(initialValues);
    setAvatarFile(null);
    setAvatarPreview(initialValues.avatarUrl);
    setAvatarError(null);
    setErrors({});
    setTouched({});
    onCancel?.();
  };

  const nameError = touched.name ? errors.name : undefined;
  const emailError = touched.email ? errors.email : undefined;

  return (
    <div className="profile-settings">
      <Flex direction="column" gap={6}>
        <Flex direction="column" gap={1}>
          <Text as="h1" variant="header-2">
            Настройки профиля
          </Text>
          <Text as="p" variant="body-1" color="secondary">
            Личные данные, язык интерфейса и уведомления.
          </Text>
        </Flex>

        <Section title="Основное">
          <Field label="Аватар" hint="PNG, JPEG или WebP до 5 МБ" inline>
            <Flex alignItems="center" gap={4} wrap>
              {avatarPreview ? (
                <Avatar size="xl" imgUrl={avatarPreview} alt="Аватар пользователя" />
              ) : (
                <Avatar size="xl" icon={Person} aria-label="Аватар не загружен" />
              )}
              <input
                ref={fileInputRef}
                className="profile-settings__file-input"
                type="file"
                accept={ACCEPTED_AVATAR_TYPES}
                onChange={handleAvatarChange}
                aria-label="Загрузить аватар"
                tabIndex={-1}
              />
              <Flex gap={2} wrap>
                <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
                  <Icon data={ArrowUpFromLine} size={16} />
                  Загрузить
                </Button>
                {avatarPreview ? (
                  <Button view="flat-danger" onClick={handleAvatarRemove}>
                    <Icon data={TrashBin} size={16} />
                    Удалить
                  </Button>
                ) : null}
              </Flex>
            </Flex>
            {avatarError ? (
              <Text as="div" variant="body-1" color="danger" className={spacing({mt: 1})}>
                {avatarError}
              </Text>
            ) : null}
          </Field>

          <Field id="profile-name" label="Имя">
            <TextInput
              id="profile-name"
              name="name"
              size="l"
              value={values.name}
              placeholder="Как к вам обращаться"
              autoComplete="name"
              hasClear
              onUpdate={(value) => update('name', value)}
              onBlur={() => setTouched((prev) => ({...prev, name: true}))}
              validationState={nameError ? 'invalid' : undefined}
              errorMessage={nameError}
            />
          </Field>

          <Field id="profile-email" label="Email">
            <TextInput
              id="profile-email"
              name="email"
              type="email"
              size="l"
              value={values.email}
              placeholder="name@example.com"
              autoComplete="email"
              hasClear
              onUpdate={(value) => update('email', value)}
              onBlur={() => setTouched((prev) => ({...prev, email: true}))}
              validationState={emailError ? 'invalid' : undefined}
              errorMessage={emailError}
            />
          </Field>
        </Section>

        <Divider />

        <Section title="Региональные настройки">
          <Field id="profile-language" label="Язык интерфейса">
            <Select
              id="profile-language"
              size="l"
              width="max"
              options={LANGUAGE_OPTIONS}
              value={[values.language]}
              onUpdate={([value]) => update('language', value)}
              placeholder="Выберите язык"
            />
          </Field>

          <Field id="profile-timezone" label="Часовой пояс">
            <Select
              id="profile-timezone"
              size="l"
              width="max"
              filterable
              filterPlaceholder="Поиск по названию"
              options={TIMEZONE_OPTIONS}
              value={[values.timezone]}
              onUpdate={([value]) => update('timezone', value)}
              placeholder="Выберите часовой пояс"
            />
          </Field>
        </Section>

        <Divider />

        <Section title="Безопасность">
          <Field
            label="Двухфакторная авторизация"
            hint="Дополнительный код при входе в аккаунт"
            inline
          >
            <Switch
              size="l"
              checked={values.twoFactorEnabled}
              onUpdate={(checked) => update('twoFactorEnabled', checked)}
              content={values.twoFactorEnabled ? 'Включена' : 'Выключена'}
            />
          </Field>
        </Section>

        <Divider />

        <Section title="Email-уведомления">
          <Field label="Присылать на почту" inline>
            <Flex direction="column" gap={3}>
              <Checkbox
                size="l"
                checked={values.notifications.productNews}
                onUpdate={(checked) => updateNotification('productNews', checked)}
                content="Новости продукта"
              />
              <Checkbox
                size="l"
                checked={values.notifications.systemAlerts}
                onUpdate={(checked) => updateNotification('systemAlerts', checked)}
                content="Системные алерты"
              />
              <Checkbox
                size="l"
                checked={values.notifications.weeklyDigest}
                onUpdate={(checked) => updateNotification('weeklyDigest', checked)}
                content="Дайджест за неделю"
              />
            </Flex>
          </Field>
        </Section>

        <div className="profile-settings__footer">
          <Flex gap={3} wrap>
            <Button view="action" size="l" loading={saving} onClick={handleSave}>
              Сохранить
            </Button>
            <Button view="flat" size="l" disabled={saving} onClick={handleCancel}>
              Отмена
            </Button>
          </Flex>
        </div>
      </Flex>
    </div>
  );
}
