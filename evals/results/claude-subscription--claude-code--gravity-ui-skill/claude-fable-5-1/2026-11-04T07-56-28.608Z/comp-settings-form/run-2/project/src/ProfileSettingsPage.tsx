import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
  useFileInput,
} from '@gravity-ui/uikit';

import './ProfileSettingsPage.css';

export interface ProfileSettings {
  name: string;
  email: string;
  avatarFile: File | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: {
    productNews: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
  };
}

export interface ProfileSettingsPageProps {
  initialValues?: Partial<ProfileSettings>;
  /** Текущий аватар пользователя (URL), пока не загружен новый. */
  avatarUrl?: string;
  onSave?: (values: ProfileSettings) => void;
  onCancel?: () => void;
}

const DEFAULT_VALUES: ProfileSettings = {
  name: '',
  email: '',
  avatarFile: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

const LANGUAGE_OPTIONS = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'},
  {value: 'es', content: 'Español'},
  {value: 'fr', content: 'Français'},
  {value: 'tr', content: 'Türkçe'},
  {value: 'zh', content: '中文'},
];

const TIMEZONE_OPTIONS = [
  {value: 'Pacific/Honolulu', content: '(UTC−10:00) Гонолулу'},
  {value: 'America/Los_Angeles', content: '(UTC−08:00) Лос-Анджелес'},
  {value: 'America/New_York', content: '(UTC−05:00) Нью-Йорк'},
  {value: 'America/Sao_Paulo', content: '(UTC−03:00) Сан-Паулу'},
  {value: 'UTC', content: '(UTC+00:00) UTC'},
  {value: 'Europe/London', content: '(UTC+00:00) Лондон'},
  {value: 'Europe/Berlin', content: '(UTC+01:00) Берлин'},
  {value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград'},
  {value: 'Europe/Moscow', content: '(UTC+03:00) Москва'},
  {value: 'Europe/Samara', content: '(UTC+04:00) Самара'},
  {value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург'},
  {value: 'Asia/Almaty', content: '(UTC+06:00) Алматы'},
  {value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск'},
  {value: 'Asia/Krasnoyarsk', content: '(UTC+07:00) Красноярск'},
  {value: 'Asia/Irkutsk', content: '(UTC+08:00) Иркутск'},
  {value: 'Asia/Shanghai', content: '(UTC+08:00) Шанхай'},
  {value: 'Asia/Yakutsk', content: '(UTC+09:00) Якутск'},
  {value: 'Asia/Tokyo', content: '(UTC+09:00) Токио'},
  {value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток'},
  {value: 'Asia/Magadan', content: '(UTC+11:00) Магадан'},
  {value: 'Asia/Kamchatka', content: '(UTC+12:00) Петропавловск-Камчатский'},
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

/** Подпись + контрол. Подпись слева на широких экранах, сверху — на узких. */
function Field({label, htmlFor, hint, children}: FieldProps) {
  return (
    <Flex direction={{xs: 'column', m: 'row'}} gap={{xs: 1, m: 4}} alignItems={{m: 'flex-start'}}>
      <Box className="profile-settings__label">
        <Text as="label" variant="body-1" {...(htmlFor ? {htmlFor} : {})}>
          {label}
        </Text>
      </Box>
      <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
        {children}
        {hint ? (
          <Text variant="caption-2" color="secondary">
            {hint}
          </Text>
        ) : null}
      </Flex>
    </Flex>
  );
}

function SectionTitle({children}: {children: React.ReactNode}) {
  return <Text variant="subheader-2">{children}</Text>;
}

export function ProfileSettingsPage({
  initialValues,
  avatarUrl,
  onSave,
  onCancel,
}: ProfileSettingsPageProps) {
  const initial = React.useMemo<ProfileSettings>(
    () => ({
      ...DEFAULT_VALUES,
      ...initialValues,
      notifications: {...DEFAULT_VALUES.notifications, ...initialValues?.notifications},
    }),
    [initialValues],
  );

  const [values, setValues] = React.useState<ProfileSettings>(initial);
  const [errors, setErrors] = React.useState<{name?: string; email?: string}>({});
  const [avatarPreview, setAvatarPreview] = React.useState<string | undefined>(undefined);

  // Превью выбранного файла через object URL; освобождаем при замене/размонтировании.
  React.useEffect(() => {
    if (!values.avatarFile) {
      setAvatarPreview(undefined);
      return undefined;
    }
    const url = URL.createObjectURL(values.avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [values.avatarFile]);

  const handleFiles = React.useCallback((files: File[]) => {
    const file = files[0];
    if (file) {
      setValues((prev) => ({...prev, avatarFile: file}));
    }
  }, []);

  const {controlProps: fileControlProps, triggerProps: fileTriggerProps} = useFileInput({
    onUpdate: handleFiles,
  });

  const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setValues((prev) => ({...prev, [key]: value}));
  };

  const updateNotification = (key: keyof ProfileSettings['notifications'], checked: boolean) => {
    setValues((prev) => ({
      ...prev,
      notifications: {...prev.notifications, [key]: checked},
    }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!values.name.trim()) {
      next.name = 'Укажите имя';
    }
    if (!values.email.trim()) {
      next.email = 'Укажите email';
    } else if (!EMAIL_RE.test(values.email.trim())) {
      next.email = 'Некорректный email';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    onSave?.({...values, name: values.name.trim(), email: values.email.trim()});
  };

  const handleCancel = () => {
    setValues(initial);
    setErrors({});
    onCancel?.();
  };

  const currentAvatarUrl = avatarPreview ?? avatarUrl;

  return (
    <Box as="main" spacing={{p: 6}} maxWidth={760} style={{marginInline: 'auto'}}>
      <form onSubmit={handleSubmit} noValidate>
        <Flex direction="column" gap={6}>
          <Flex direction="column" gap={1}>
            <Text as="h1" variant="header-1" style={{margin: 0}}>
              Настройки профиля
            </Text>
            <Text variant="body-1" color="secondary">
              Личные данные, язык интерфейса, безопасность и уведомления.
            </Text>
          </Flex>

          <Card type="container" view="outlined" size="l">
            <Flex direction="column" gap={5}>
              <SectionTitle>Основное</SectionTitle>

              <Field label="Аватар" hint="PNG, JPG или WebP">
                <Flex alignItems="center" gap={3} wrap>
                  {currentAvatarUrl ? (
                    <Avatar
                      size="xl"
                      imgUrl={currentAvatarUrl}
                      alt={values.name || 'Аватар'}
                      style={{flexShrink: 0}}
                    />
                  ) : (
                    <Avatar
                      size="xl"
                      text={getInitials(values.name)}
                      theme="brand"
                      style={{flexShrink: 0}}
                    />
                  )}
                  <input {...fileControlProps} accept="image/png,image/jpeg,image/webp" />
                  <Flex gap={2} wrap>
                    <Button view="outlined" size="m" {...fileTriggerProps}>
                      Загрузить
                    </Button>
                    {values.avatarFile ? (
                      <Button view="flat" size="m" onClick={() => update('avatarFile', null)}>
                        Убрать
                      </Button>
                    ) : null}
                  </Flex>
                  {values.avatarFile ? (
                    <Text variant="caption-2" color="secondary" ellipsis style={{minWidth: 0}}>
                      {values.avatarFile.name}
                    </Text>
                  ) : null}
                </Flex>
              </Field>

              <Field label="Имя" htmlFor="profile-name">
                <TextInput
                  id="profile-name"
                  name="name"
                  size="l"
                  value={values.name}
                  onUpdate={(value) => update('name', value)}
                  placeholder="Иван Иванов"
                  autoComplete="name"
                  validationState={errors.name ? 'invalid' : undefined}
                  errorMessage={errors.name}
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
                  onUpdate={(value) => update('email', value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  validationState={errors.email ? 'invalid' : undefined}
                  errorMessage={errors.email}
                  errorPlacement="outside"
                />
              </Field>

              <Divider />
              <SectionTitle>Локализация</SectionTitle>

              <Field label="Язык интерфейса">
                <Select
                  size="l"
                  width="max"
                  name="language"
                  aria-label="Язык интерфейса"
                  options={LANGUAGE_OPTIONS}
                  value={[values.language]}
                  onUpdate={([value]) => value && update('language', value)}
                />
              </Field>

              <Field label="Часовой пояс">
                <Select
                  size="l"
                  width="max"
                  name="timezone"
                  aria-label="Часовой пояс"
                  filterable
                  filterPlaceholder="Поиск города"
                  options={TIMEZONE_OPTIONS}
                  value={[values.timezone]}
                  onUpdate={([value]) => value && update('timezone', value)}
                />
              </Field>

              <Divider />
              <SectionTitle>Безопасность</SectionTitle>

              <Field
                label="Двухфакторная авторизация"
                hint="При входе потребуется код из приложения-аутентификатора."
              >
                <Switch
                  size="l"
                  name="twoFactorEnabled"
                  checked={values.twoFactorEnabled}
                  onUpdate={(checked) => update('twoFactorEnabled', checked)}
                >
                  {values.twoFactorEnabled ? 'Включена' : 'Выключена'}
                </Switch>
              </Field>

              <Divider />
              <SectionTitle>Email-уведомления</SectionTitle>

              <Field label="Присылать на почту">
                <Flex direction="column" gap={2}>
                  <Checkbox
                    size="l"
                    name="productNews"
                    checked={values.notifications.productNews}
                    onUpdate={(checked) => updateNotification('productNews', checked)}
                  >
                    Новости продукта
                  </Checkbox>
                  <Checkbox
                    size="l"
                    name="systemAlerts"
                    checked={values.notifications.systemAlerts}
                    onUpdate={(checked) => updateNotification('systemAlerts', checked)}
                  >
                    Системные алерты
                  </Checkbox>
                  <Checkbox
                    size="l"
                    name="weeklyDigest"
                    checked={values.notifications.weeklyDigest}
                    onUpdate={(checked) => updateNotification('weeklyDigest', checked)}
                  >
                    Дайджест за неделю
                  </Checkbox>
                </Flex>
              </Field>
            </Flex>
          </Card>

          <Flex gap={3} justifyContent="flex-end" wrap>
            <Button view="flat" size="l" type="button" onClick={handleCancel}>
              Отмена
            </Button>
            <Button view="action" size="l" type="submit">
              Сохранить
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
