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
  useFileInput,
} from '@gravity-ui/uikit';
import {ArrowUpFromSquare, Person, TrashBin} from '@gravity-ui/icons';

const LANGUAGE_OPTIONS = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'},
  {value: 'fr', content: 'Français'},
  {value: 'es', content: 'Español'},
  {value: 'tr', content: 'Türkçe'},
  {value: 'kk', content: 'Қазақша'},
];

const TIMEZONE_OPTIONS = [
  {value: 'Europe/Moscow', content: '(UTC+03:00) Москва, Санкт-Петербург'},
  {value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград'},
  {value: 'Europe/Samara', content: '(UTC+04:00) Самара'},
  {value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург'},
  {value: 'Asia/Omsk', content: '(UTC+06:00) Омск'},
  {value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск'},
  {value: 'Asia/Krasnoyarsk', content: '(UTC+07:00) Красноярск'},
  {value: 'Asia/Irkutsk', content: '(UTC+08:00) Иркутск'},
  {value: 'Asia/Yakutsk', content: '(UTC+09:00) Якутск'},
  {value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток'},
  {value: 'Asia/Kamchatka', content: '(UTC+12:00) Камчатка'},
  {value: 'Asia/Almaty', content: '(UTC+05:00) Алматы'},
  {value: 'Asia/Tbilisi', content: '(UTC+04:00) Тбилиси'},
  {value: 'Asia/Yerevan', content: '(UTC+04:00) Ереван'},
  {value: 'Europe/Minsk', content: '(UTC+03:00) Минск'},
  {value: 'Europe/Istanbul', content: '(UTC+03:00) Стамбул'},
  {value: 'Europe/Berlin', content: '(UTC+01:00) Берлин, Париж, Мадрид'},
  {value: 'Europe/London', content: '(UTC+00:00) Лондон, Лиссабон'},
  {value: 'America/New_York', content: '(UTC−05:00) Нью-Йорк'},
  {value: 'America/Los_Angeles', content: '(UTC−08:00) Лос-Анджелес'},
  {value: 'Asia/Dubai', content: '(UTC+04:00) Дубай'},
  {value: 'Asia/Singapore', content: '(UTC+08:00) Сингапур'},
  {value: 'Asia/Tokyo', content: '(UTC+09:00) Токио'},
  {value: 'UTC', content: '(UTC+00:00) UTC'},
];

export interface ProfileSettings {
  name: string;
  email: string;
  /** URL of the current avatar; `null` means "no avatar" */
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: {
    productNews: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
  };
}

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
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

interface ProfileSettingsPageProps {
  initialValues?: ProfileSettings;
  /** Called with the new settings and the picked avatar file (if the user chose one) */
  onSave?: (values: ProfileSettings, avatarFile: File | null) => void | Promise<void>;
  onCancel?: () => void;
}

type FieldErrors = Partial<Record<'name' | 'email', string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: ProfileSettings): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) {
    errors.name = 'Укажите имя';
  }
  if (!values.email.trim()) {
    errors.email = 'Укажите email';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Некорректный email';
  }
  return errors;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}

/** Label above control; the label is a real <label> wired to the control by id */
function Field({id, label, hint, children}: FieldProps) {
  return (
    <Flex direction="column" gap={1}>
      <Text as="label" variant="subheader-1" htmlFor={id}>
        {label}
      </Text>
      {children}
      {hint ? (
        <Text variant="body-1" color="secondary">
          {hint}
        </Text>
      ) : null}
    </Flex>
  );
}

export function ProfileSettingsPage({
  initialValues = DEFAULT_PROFILE_SETTINGS,
  onSave,
  onCancel,
}: ProfileSettingsPageProps) {
  const [values, setValues] = React.useState<ProfileSettings>(initialValues);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Object URLs must be released, otherwise every picked file leaks until page unload
  React.useEffect(() => {
    if (!avatarPreviewUrl) {
      return undefined;
    }
    return () => URL.revokeObjectURL(avatarPreviewUrl);
  }, [avatarPreviewUrl]);

  const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setValues((prev) => ({...prev, [key]: value}));
    setSaved(false);
  };

  const updateNotification = (key: keyof ProfileSettings['notifications'], checked: boolean) => {
    setValues((prev) => ({
      ...prev,
      notifications: {...prev.notifications, [key]: checked},
    }));
    setSaved(false);
  };

  const handleAvatarUpdate = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarError('Можно загрузить только изображение');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Файл слишком большой, максимум 5 МБ');
      return;
    }
    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setSaved(false);
  }, []);

  const {controlProps: fileControlProps, triggerProps: fileTriggerProps} = useFileInput({
    onUpdate: handleAvatarUpdate,
  });

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    setAvatarError(null);
    update('avatarUrl', null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setSaving(true);
    try {
      await onSave?.({...values, name: values.name.trim(), email: values.email.trim()}, avatarFile);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValues(initialValues);
    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    setAvatarError(null);
    setErrors({});
    setSaved(false);
    onCancel?.();
  };

  const shownAvatarUrl = avatarPreviewUrl ?? values.avatarUrl;
  const initials = getInitials(values.name);
  const hasAvatar = Boolean(shownAvatarUrl);

  return (
    <Box as="main" maxWidth={640} width="100%" spacing={{px: 4, py: 6}} style={{marginInline: 'auto'}}>
      <form onSubmit={handleSubmit} noValidate>
        <Flex direction="column" gap={6}>
          <Flex direction="column" gap={1}>
            <Text as="h1" variant="header-2">
              Настройки профиля
            </Text>
            <Text variant="body-1" color="secondary">
              Личные данные, язык интерфейса, безопасность и уведомления.
            </Text>
          </Flex>

          <Card type="container" view="outlined" spacing={{p: 6}}>
            <Flex direction="column" gap={6}>
              {/* Avatar */}
              <Flex direction="column" gap={2}>
                <Text variant="subheader-1">Аватар</Text>
                <Flex alignItems="center" gap={4} wrap>
                  {shownAvatarUrl ? (
                    <Avatar
                      size="xl"
                      imgUrl={shownAvatarUrl}
                      alt={values.name || 'Аватар'}
                      style={{flexShrink: 0}}
                    />
                  ) : initials ? (
                    <Avatar size="xl" text={initials} theme="brand" style={{flexShrink: 0}} />
                  ) : (
                    <Avatar size="xl" icon={Person} theme="brand" style={{flexShrink: 0}} />
                  )}
                  <input
                    {...fileControlProps}
                    accept="image/*"
                    aria-label="Загрузить аватар"
                    style={{display: 'none'}}
                  />
                  <Flex gap={2} wrap>
                    <Button view="outlined" size="m" {...fileTriggerProps}>
                      <Icon data={ArrowUpFromSquare} size={16} />
                      {hasAvatar ? 'Заменить' : 'Загрузить'}
                    </Button>
                    {hasAvatar ? (
                      <Button view="flat-danger" size="m" onClick={removeAvatar}>
                        <Icon data={TrashBin} size={16} />
                        Удалить
                      </Button>
                    ) : null}
                  </Flex>
                </Flex>
                <Text variant="body-1" color={avatarError ? 'danger' : 'secondary'}>
                  {avatarError ?? 'PNG или JPG, не больше 5 МБ.'}
                </Text>
              </Flex>

              <Field id="profile-name" label="Имя">
                <TextInput
                  id="profile-name"
                  name="name"
                  size="l"
                  value={values.name}
                  onUpdate={(value) => {
                    update('name', value);
                    if (errors.name) {
                      setErrors((prev) => ({...prev, name: undefined}));
                    }
                  }}
                  placeholder="Как к вам обращаться"
                  autoComplete="name"
                  hasClear
                  validationState={errors.name ? 'invalid' : undefined}
                  errorMessage={errors.name}
                />
              </Field>

              <Field id="profile-email" label="Email" hint="На этот адрес будут приходить уведомления.">
                <TextInput
                  id="profile-email"
                  name="email"
                  type="email"
                  size="l"
                  value={values.email}
                  onUpdate={(value) => {
                    update('email', value);
                    if (errors.email) {
                      setErrors((prev) => ({...prev, email: undefined}));
                    }
                  }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  hasClear
                  validationState={errors.email ? 'invalid' : undefined}
                  errorMessage={errors.email}
                />
              </Field>
            </Flex>
          </Card>

          <Card type="container" view="outlined" spacing={{p: 6}}>
            <Flex direction="column" gap={6}>
              <Text variant="header-1">Язык и регион</Text>

              <Field id="profile-language" label="Язык интерфейса">
                <Select
                  id="profile-language"
                  name="language"
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
                  name="timezone"
                  size="l"
                  width="max"
                  filterable
                  filterPlaceholder="Поиск по городу"
                  options={TIMEZONE_OPTIONS}
                  value={[values.timezone]}
                  onUpdate={([value]) => update('timezone', value)}
                  placeholder="Выберите часовой пояс"
                />
              </Field>
            </Flex>
          </Card>

          <Card type="container" view="outlined" spacing={{p: 6}}>
            <Flex direction="column" gap={6}>
              <Text variant="header-1">Безопасность</Text>

              <Flex alignItems="flex-start" justifyContent="space-between" gap={4}>
                <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                  <Text as="label" variant="subheader-1" htmlFor="profile-2fa">
                    Двухфакторная авторизация
                  </Text>
                  <Text variant="body-1" color="secondary">
                    При входе будет запрашиваться одноразовый код из приложения-аутентификатора.
                  </Text>
                </Flex>
                <Switch
                  id="profile-2fa"
                  name="twoFactorEnabled"
                  size="l"
                  checked={values.twoFactorEnabled}
                  onUpdate={(checked) => update('twoFactorEnabled', checked)}
                  style={{flexShrink: 0}}
                />
              </Flex>
            </Flex>
          </Card>

          <Card type="container" view="outlined" spacing={{p: 6}}>
            <Flex direction="column" gap={4}>
              <Flex direction="column" gap={1}>
                <Text variant="header-1">Email-уведомления</Text>
                <Text variant="body-1" color="secondary">
                  Выберите, какие письма вы хотите получать.
                </Text>
              </Flex>

              <Divider />

              <Flex direction="column" gap={3}>
                <Checkbox
                  size="l"
                  name="productNews"
                  checked={values.notifications.productNews}
                  onUpdate={(checked) => updateNotification('productNews', checked)}
                  content="Новости продукта"
                />
                <Checkbox
                  size="l"
                  name="systemAlerts"
                  checked={values.notifications.systemAlerts}
                  onUpdate={(checked) => updateNotification('systemAlerts', checked)}
                  content="Системные алерты"
                />
                <Checkbox
                  size="l"
                  name="weeklyDigest"
                  checked={values.notifications.weeklyDigest}
                  onUpdate={(checked) => updateNotification('weeklyDigest', checked)}
                  content="Дайджест за неделю"
                />
              </Flex>
            </Flex>
          </Card>

          <Flex alignItems="center" gap={3} wrap>
            <Button type="submit" view="action" size="l" loading={saving}>
              Сохранить
            </Button>
            <Button type="button" view="flat" size="l" onClick={handleCancel} disabled={saving}>
              Отмена
            </Button>
            {saved ? (
              <Text variant="body-1" color="positive" role="status">
                Изменения сохранены
              </Text>
            ) : null}
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
