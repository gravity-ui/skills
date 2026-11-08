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

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const LANGUAGE_OPTIONS = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'},
  {value: 'fr', content: 'Français'},
  {value: 'es', content: 'Español'},
  {value: 'tr', content: 'Türkçe'},
];

const TIMEZONE_OPTIONS = [
  {value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград'},
  {value: 'Europe/Moscow', content: '(UTC+03:00) Москва'},
  {value: 'Europe/Samara', content: '(UTC+04:00) Самара'},
  {value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург'},
  {value: 'Asia/Omsk', content: '(UTC+06:00) Омск'},
  {value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск'},
  {value: 'Asia/Irkutsk', content: '(UTC+08:00) Иркутск'},
  {value: 'Asia/Yakutsk', content: '(UTC+09:00) Якутск'},
  {value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток'},
  {value: 'Asia/Kamchatka', content: '(UTC+12:00) Камчатка'},
  {value: 'Europe/London', content: '(UTC+00:00) Лондон'},
  {value: 'Europe/Berlin', content: '(UTC+01:00) Берлин'},
  {value: 'America/New_York', content: '(UTC−05:00) Нью-Йорк'},
  {value: 'America/Los_Angeles', content: '(UTC−08:00) Лос-Анджелес'},
];

const NOTIFICATION_OPTIONS = [
  {key: 'productNews', title: 'Новости продукта', description: 'Обновления, новые функции и анонсы'},
  {key: 'systemAlerts', title: 'Системные алерты', description: 'Важные события безопасности и работы сервиса'},
  {key: 'weeklyDigest', title: 'Дайджест за неделю', description: 'Сводка активности раз в неделю'},
] as const;

type NotificationKey = (typeof NOTIFICATION_OPTIONS)[number]['key'];

export interface ProfileSettingsValues {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: Record<NotificationKey, boolean>;
}

const INITIAL_VALUES: ProfileSettingsValues = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifications: {productNews: true, systemAlerts: true, weeklyDigest: false},
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name: string) {
  return name.trim() ? undefined : 'Введите имя';
}

function validateEmail(email: string) {
  if (!email.trim()) return 'Введите email';
  return EMAIL_RE.test(email.trim()) ? undefined : 'Некорректный email';
}

interface FieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

function Field({id, label, children}: FieldProps) {
  return (
    <Flex direction="column" gap={1}>
      <Text as="label" htmlFor={id} variant="body-2">
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export interface ProfileSettingsProps {
  initialValues?: ProfileSettingsValues;
  onSave?: (values: ProfileSettingsValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function ProfileSettings({
  initialValues = INITIAL_VALUES,
  onSave,
  onCancel,
}: ProfileSettingsProps) {
  const [values, setValues] = React.useState<ProfileSettingsValues>(initialValues);
  const [saved, setSaved] = React.useState<ProfileSettingsValues>(initialValues);
  const [touched, setTouched] = React.useState({name: false, email: false});
  const [avatarError, setAvatarError] = React.useState<string>();
  const [saving, setSaving] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);

  // Object URLs created for avatar previews; revoked when replaced or on unmount.
  const objectUrlRef = React.useRef<string | null>(null);
  const releaseObjectUrl = React.useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);
  React.useEffect(() => releaseObjectUrl, [releaseObjectUrl]);

  const patch = (partial: Partial<ProfileSettingsValues>) => {
    setJustSaved(false);
    setValues((prev) => ({...prev, ...partial}));
  };

  const handleFiles = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setAvatarError('Выберите файл изображения');
        return;
      }
      if (file.size > MAX_AVATAR_SIZE) {
        setAvatarError('Размер файла не должен превышать 5 МБ');
        return;
      }
      setAvatarError(undefined);
      releaseObjectUrl();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setJustSaved(false);
      setValues((prev) => ({...prev, avatarUrl: url}));
    },
    [releaseObjectUrl],
  );

  const {controlProps, triggerProps} = useFileInput({onUpdate: handleFiles});

  const removeAvatar = () => {
    releaseObjectUrl();
    setAvatarError(undefined);
    patch({avatarUrl: null});
  };

  const nameError = validateName(values.name);
  const emailError = validateEmail(values.email);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({name: true, email: true});
    if (nameError || emailError) return;

    setSaving(true);
    try {
      const next = {...values, name: values.name.trim(), email: values.email.trim()};
      await onSave?.(next);
      setSaved(next);
      setValues(next);
      setJustSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    releaseObjectUrl();
    // Restore the last saved state; a saved avatar may itself be a blob URL we no longer own.
    setValues(saved);
    setTouched({name: false, email: false});
    setAvatarError(undefined);
    setJustSaved(false);
    onCancel?.();
  };

  return (
    <Box spacing={{px: 4, py: 6}} maxWidth={720} style={{margin: '0 auto'}}>
      <form onSubmit={handleSubmit} noValidate>
        <Flex direction="column" gap={5}>
          <Text variant="header-1">Настройки профиля</Text>

          <Card type="container" view="outlined" size="l">
            <Flex direction="column" gap={4}>
              <Text variant="subheader-2">Личные данные</Text>

              <Flex alignItems="center" gap={4}>
                <Avatar
                  size="xl"
                  {...(values.avatarUrl
                    ? {imgUrl: values.avatarUrl, alt: 'Аватар'}
                    : {text: values.name.trim() || '?'})}
                  style={{flexShrink: 0}}
                />
                <Flex direction="column" gap={2} grow style={{minWidth: 0}}>
                  <Flex gap={2} wrap>
                    <input {...controlProps} accept="image/*" />
                    <Button view="outlined" {...triggerProps}>
                      Загрузить фото
                    </Button>
                    {values.avatarUrl ? (
                      <Button view="flat-danger" onClick={removeAvatar}>
                        Удалить
                      </Button>
                    ) : null}
                  </Flex>
                  <Text variant="caption-2" color={avatarError ? 'danger' : 'secondary'}>
                    {avatarError ?? 'JPG, PNG или GIF, до 5 МБ'}
                  </Text>
                </Flex>
              </Flex>

              <Field id="profile-name" label="Имя">
                <TextInput
                  id="profile-name"
                  size="l"
                  value={values.name}
                  onUpdate={(name) => patch({name})}
                  onBlur={() => setTouched((t) => ({...t, name: true}))}
                  autoComplete="name"
                  validationState={touched.name && nameError ? 'invalid' : undefined}
                  errorMessage={touched.name ? nameError : undefined}
                />
              </Field>

              <Field id="profile-email" label="Email">
                <TextInput
                  id="profile-email"
                  size="l"
                  type="email"
                  value={values.email}
                  onUpdate={(email) => patch({email})}
                  onBlur={() => setTouched((t) => ({...t, email: true}))}
                  autoComplete="email"
                  validationState={touched.email && emailError ? 'invalid' : undefined}
                  errorMessage={touched.email ? emailError : undefined}
                />
              </Field>
            </Flex>
          </Card>

          <Card type="container" view="outlined" size="l">
            <Flex direction="column" gap={4}>
              <Text variant="subheader-2">Региональные настройки</Text>

              <Field id="profile-language" label="Язык интерфейса">
                <Select
                  id="profile-language"
                  size="l"
                  width="max"
                  value={[values.language]}
                  options={LANGUAGE_OPTIONS}
                  onUpdate={([language]) => language && patch({language})}
                />
              </Field>

              <Field id="profile-timezone" label="Часовой пояс">
                <Select
                  id="profile-timezone"
                  size="l"
                  width="max"
                  filterable
                  filterPlaceholder="Поиск"
                  value={[values.timezone]}
                  options={TIMEZONE_OPTIONS}
                  onUpdate={([timezone]) => timezone && patch({timezone})}
                />
              </Field>
            </Flex>
          </Card>

          <Card type="container" view="outlined" size="l">
            <Flex direction="column" gap={4}>
              <Text variant="subheader-2">Безопасность</Text>
              <Flex alignItems="center" justifyContent="space-between" gap={4}>
                <Flex direction="column" gap={1} grow style={{minWidth: 0}}>
                  <Text variant="body-2">Двухфакторная авторизация</Text>
                  <Text variant="body-1" color="secondary">
                    Запрашивать одноразовый код при входе в аккаунт
                  </Text>
                </Flex>
                <Switch
                  size="l"
                  checked={values.twoFactor}
                  onUpdate={(twoFactor) => patch({twoFactor})}
                  controlProps={{'aria-label': 'Двухфакторная авторизация'}}
                  style={{flexShrink: 0}}
                />
              </Flex>
            </Flex>
          </Card>

          <Card type="container" view="outlined" size="l">
            <Flex direction="column" gap={4} role="group" aria-labelledby="profile-notifications">
              <Text variant="subheader-2" id="profile-notifications">
                Email-уведомления
              </Text>
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
                    <Text variant="body-1" color="secondary">
                      {description}
                    </Text>
                  </Flex>
                </Checkbox>
              ))}
            </Flex>
          </Card>

          <Divider />

          <Flex alignItems="center" justifyContent="flex-end" gap={3} wrap>
            {justSaved ? (
              <Text variant="body-1" color="positive" style={{marginRight: 'auto'}}>
                Изменения сохранены
              </Text>
            ) : null}
            <Button view="flat" size="l" type="button" onClick={handleCancel} disabled={saving}>
              Отмена
            </Button>
            <Button view="action" size="l" type="submit" loading={saving}>
              Сохранить
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
