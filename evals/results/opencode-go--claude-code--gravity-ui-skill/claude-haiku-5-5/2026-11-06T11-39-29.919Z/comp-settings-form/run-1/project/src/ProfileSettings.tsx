import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
  useFileInput,
} from '@gravity-ui/uikit';

type NotificationKey = 'news' | 'system' | 'digest';

interface ProfileValues {
  name: string;
  email: string;
  avatar: File | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: Record<NotificationKey, boolean>;
}

type FormErrors = Partial<Record<keyof ProfileValues, string>>;

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LANGUAGE_OPTIONS = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'},
  {value: 'fr', content: 'Français'},
  {value: 'es', content: 'Español'},
];

const TIMEZONE_OPTIONS = [
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Asia/Dubai',
  'Asia/Almaty',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
].map((tz) => ({value: tz, content: tz}));

const NOTIFICATION_OPTIONS: {key: NotificationKey; label: string}[] = [
  {key: 'news', label: 'Новости продукта'},
  {key: 'system', label: 'Системные алерты'},
  {key: 'digest', label: 'Дайджест за неделю'},
];

// Stand-in for the profile loaded from the server.
const INITIAL_VALUES: ProfileValues = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
  avatar: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {news: false, system: true, digest: true},
};

function validate(values: ProfileValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) {
    errors.name = 'Укажите имя';
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Введите корректный email';
  }
  return errors;
}

function isSameValues(a: ProfileValues, b: ProfileValues): boolean {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.avatar === b.avatar &&
    a.language === b.language &&
    a.timezone === b.timezone &&
    a.twoFactorEnabled === b.twoFactorEnabled &&
    NOTIFICATION_OPTIONS.every(({key}) => a.notifications[key] === b.notifications[key])
  );
}

// Object URL for the avatar preview. Created in an effect (not useMemo) so that
// StrictMode's mount/unmount/mount cycle does not revoke a URL that is still in use.
function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

function Field({label, htmlFor, children}: {label: string; htmlFor: string; children: React.ReactNode}) {
  return (
    <Flex direction="column" gap={2}>
      <Text as="label" htmlFor={htmlFor} variant="subheader-1">
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export function ProfileSettings() {
  const [saved, setSaved] = React.useState<ProfileValues>(INITIAL_VALUES);
  const [draft, setDraft] = React.useState<ProfileValues>(INITIAL_VALUES);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSaved, setIsSaved] = React.useState(false);

  const isDirty = !isSameValues(draft, saved);
  const avatarPreview = useObjectUrl(draft.avatar);

  const update = <K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) => {
    setDraft((prev) => ({...prev, [key]: value}));
    setErrors((prev) => ({...prev, [key]: undefined}));
    setIsSaved(false);
  };

  const {controlProps: avatarInputProps, triggerProps: avatarTriggerProps} = useFileInput({
    onUpdate: (files) => {
      const [file] = files;
      if (!file) {
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({...prev, avatar: 'Можно загрузить только изображение'}));
        return;
      }
      if (file.size > MAX_AVATAR_SIZE) {
        setErrors((prev) => ({...prev, avatar: 'Максимальный размер файла — 2 МБ'}));
        return;
      }
      update('avatar', file);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Only name/email are re-validated here; avatar errors come from the upload step.
    const nextErrors: FormErrors = {...validate(draft), avatar: errors.avatar};
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    // No backend in this project: "saving" means the draft becomes the saved state.
    setSaved(draft);
    setIsSaved(true);
  };

  const handleCancel = () => {
    setDraft(saved);
    setErrors({});
    setIsSaved(false);
  };

  return (
    <Box spacing={{p: 6}} maxWidth={720}>
      <form onSubmit={handleSubmit} noValidate>
        <Flex direction="column" gap={6}>
          <Text as="h1" variant="header-1">
            Настройки профиля
          </Text>

          <Flex direction="column" gap={5}>
            <Text variant="header-2">Профиль</Text>

            <Flex alignItems="center" gap={4} wrap>
              {draft.avatar && avatarPreview ? (
                <Avatar size="xl" imgUrl={avatarPreview} alt="Аватар" />
              ) : (
                <Avatar size="xl" text={draft.name} />
              )}
              <Flex direction="column" gap={1}>
                <input {...avatarInputProps} accept="image/*" />
                <Button type="button" view="outlined" {...avatarTriggerProps}>
                  Загрузить аватар
                </Button>
                <Text variant="caption-1" color={errors.avatar ? 'danger' : 'secondary'}>
                  {errors.avatar ?? 'Изображение до 2 МБ'}
                </Text>
              </Flex>
            </Flex>

            <Field label="Имя" htmlFor="profile-name">
              <TextInput
                id="profile-name"
                autoComplete="name"
                value={draft.name}
                onUpdate={(value) => update('name', value)}
                validationState={errors.name ? 'invalid' : undefined}
                errorMessage={errors.name}
              />
            </Field>

            <Field label="Email" htmlFor="profile-email">
              <TextInput
                id="profile-email"
                type="email"
                autoComplete="email"
                value={draft.email}
                onUpdate={(value) => update('email', value)}
                validationState={errors.email ? 'invalid' : undefined}
                errorMessage={errors.email}
              />
            </Field>
          </Flex>

          <Divider />

          <Flex direction="column" gap={5}>
            <Text variant="header-2">Интерфейс</Text>

            <Field label="Язык интерфейса" htmlFor="profile-language">
              <Select
                id="profile-language"
                width="max"
                options={LANGUAGE_OPTIONS}
                value={[draft.language]}
                onUpdate={(value) => update('language', value[0] ?? draft.language)}
              />
            </Field>

            <Field label="Часовой пояс" htmlFor="profile-timezone">
              <Select
                id="profile-timezone"
                width="max"
                filterable
                options={TIMEZONE_OPTIONS}
                value={[draft.timezone]}
                onUpdate={(value) => update('timezone', value[0] ?? draft.timezone)}
              />
            </Field>
          </Flex>

          <Divider />

          <Flex direction="column" gap={5}>
            <Text variant="header-2">Безопасность</Text>

            <Flex direction="column" gap={1}>
              <Switch
                size="l"
                content="Двухфакторная авторизация"
                checked={draft.twoFactorEnabled}
                onUpdate={(checked) => update('twoFactorEnabled', checked)}
              />
              <Text variant="body-1" color="secondary">
                Запрашивать код из приложения-аутентификатора при каждом входе
              </Text>
            </Flex>
          </Flex>

          <Divider />

          <Flex direction="column" gap={5}>
            <Text variant="header-2" id="notifications-title">
              Email-уведомления
            </Text>

            <Flex direction="column" gap={3} role="group" aria-labelledby="notifications-title">
              {NOTIFICATION_OPTIONS.map(({key, label}) => (
                <Checkbox
                  key={key}
                  size="l"
                  content={label}
                  checked={draft.notifications[key]}
                  onUpdate={(checked) =>
                    update('notifications', {...draft.notifications, [key]: checked})
                  }
                />
              ))}
            </Flex>
          </Flex>

          <Divider />

          <Flex alignItems="center" gap={2} wrap>
            <Button type="submit" view="action" size="l" disabled={!isDirty}>
              Сохранить
            </Button>
            <Button type="button" view="outlined" size="l" disabled={!isDirty} onClick={handleCancel}>
              Отмена
            </Button>
            {isSaved && (
              <Text variant="body-1" color="positive" role="status">
                Изменения сохранены
              </Text>
            )}
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
