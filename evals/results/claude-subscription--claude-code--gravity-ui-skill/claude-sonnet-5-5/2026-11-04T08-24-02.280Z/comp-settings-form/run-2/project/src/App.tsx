import * as React from 'react';
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
  useFileInput,
} from '@gravity-ui/uikit';

import './App.css';

type Notifications = {
  product: boolean;
  alerts: boolean;
  digest: boolean;
};

type Profile = {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: Notifications;
};

const LANGUAGE_OPTIONS = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'},
  {value: 'fr', content: 'Français'},
  {value: 'es', content: 'Español'},
];

const TIMEZONE_OPTIONS = [
  {value: 'Europe/Kaliningrad', content: 'Калининград (UTC+2)'},
  {value: 'Europe/Moscow', content: 'Москва (UTC+3)'},
  {value: 'Europe/Samara', content: 'Самара (UTC+4)'},
  {value: 'Asia/Yekaterinburg', content: 'Екатеринбург (UTC+5)'},
  {value: 'Asia/Novosibirsk', content: 'Новосибирск (UTC+7)'},
  {value: 'Asia/Vladivostok', content: 'Владивосток (UTC+10)'},
  {value: 'Europe/London', content: 'Лондон (UTC+0)'},
  {value: 'Europe/Berlin', content: 'Берлин (UTC+1)'},
  {value: 'America/New_York', content: 'Нью-Йорк (UTC−5)'},
  {value: 'America/Los_Angeles', content: 'Лос-Анджелес (UTC−8)'},
];

const NOTIFICATION_OPTIONS: {key: keyof Notifications; label: string}[] = [
  {key: 'product', label: 'Новости продукта'},
  {key: 'alerts', label: 'Системные алерты'},
  {key: 'digest', label: 'Дайджест за неделю'},
];

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_PROFILE: Profile = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifications: {product: true, alerts: true, digest: false},
};

function validateName(name: string) {
  return name.trim() ? undefined : 'Укажите имя';
}

function validateEmail(email: string) {
  if (!email.trim()) {
    return 'Укажите email';
  }
  return EMAIL_RE.test(email.trim()) ? undefined : 'Введите корректный email';
}

type FieldProps = {
  id: string;
  label: string;
  children: React.ReactNode;
};

function Field({id, label, children}: FieldProps) {
  return (
    <Flex direction="column" gap={1}>
      <Text variant="subheader-1" as="label" htmlFor={id}>
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export function App() {
  const [saved, setSaved] = React.useState<Profile>(INITIAL_PROFILE);
  const [draft, setDraft] = React.useState<Profile>(INITIAL_PROFILE);
  const [touched, setTouched] = React.useState({name: false, email: false});
  const [avatarError, setAvatarError] = React.useState<string>();
  const [saving, setSaving] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);

  // Blob-URL'ы, созданные в рамках этого экрана, чтобы освободить память при размонтировании.
  const objectUrls = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setJustSaved(false);
    setDraft((prev) => ({...prev, [key]: value}));
  };

  const updateNotification = (key: keyof Notifications, value: boolean) => {
    setJustSaved(false);
    setDraft((prev) => ({...prev, notifications: {...prev.notifications, [key]: value}}));
  };

  const onAvatarSelected = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarError('Выберите файл изображения');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Размер файла не должен превышать 5 МБ');
      return;
    }
    setAvatarError(undefined);
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    setJustSaved(false);
    setDraft((prev) => ({...prev, avatarUrl: url}));
  }, []);

  const {controlProps, triggerProps} = useFileInput({onUpdate: onAvatarSelected});

  const nameError = validateName(draft.name);
  const emailError = validateEmail(draft.email);
  const showNameError = touched.name && nameError;
  const showEmailError = touched.email && emailError;

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({name: true, email: true});
    if (nameError || emailError) {
      return;
    }
    setSaving(true);
    // Здесь должен быть запрос к API; пока имитируем сетевую задержку.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaved(draft);
    setSaving(false);
    setJustSaved(true);
  };

  const handleCancel = () => {
    setDraft(saved);
    setTouched({name: false, email: false});
    setAvatarError(undefined);
    setJustSaved(false);
  };

  return (
    <form className="profile-settings" onSubmit={handleSave} onReset={handleCancel} noValidate>
      <Flex direction="column" gap={6}>
        <Text variant="header-1">Настройки профиля</Text>

        <Card type="container" view="outlined" size="l">
          <Flex direction="column" gap={5}>
            <Text variant="header-2">Профиль</Text>

            <Flex alignItems="center" gap={4}>
              <Avatar
                size="xl"
                theme="brand"
                {...(draft.avatarUrl
                  ? {imgUrl: draft.avatarUrl, alt: 'Аватар'}
                  : {text: draft.name || '?'})}
                style={{flexShrink: 0}}
              />
              <Flex direction="column" gap={1} grow style={{minWidth: 0}}>
                <input {...controlProps} accept="image/*" />
                <Flex gap={2} wrap>
                  <Button view="outlined" {...triggerProps}>
                    Загрузить аватар
                  </Button>
                  {draft.avatarUrl && (
                    <Button view="flat-secondary" onClick={() => update('avatarUrl', null)}>
                      Удалить
                    </Button>
                  )}
                </Flex>
                <Text variant="caption-2" color={avatarError ? 'danger' : 'secondary'}>
                  {avatarError ?? 'PNG, JPG или GIF, до 5 МБ'}
                </Text>
              </Flex>
            </Flex>

            <Field id="profile-name" label="Имя">
              <TextInput
                id="profile-name"
                size="l"
                value={draft.name}
                onUpdate={(value) => update('name', value)}
                onBlur={() => setTouched((prev) => ({...prev, name: true}))}
                validationState={showNameError ? 'invalid' : undefined}
                errorMessage={showNameError || undefined}
                autoComplete="name"
              />
            </Field>

            <Field id="profile-email" label="Email">
              <TextInput
                id="profile-email"
                type="email"
                size="l"
                value={draft.email}
                onUpdate={(value) => update('email', value)}
                onBlur={() => setTouched((prev) => ({...prev, email: true}))}
                validationState={showEmailError ? 'invalid' : undefined}
                errorMessage={showEmailError || undefined}
                autoComplete="email"
              />
            </Field>
          </Flex>
        </Card>

        <Card type="container" view="outlined" size="l">
          <Flex direction="column" gap={5}>
            <Text variant="header-2">Региональные настройки</Text>

            <Field id="profile-language" label="Язык интерфейса">
              <Select
                id="profile-language"
                size="l"
                width="max"
                options={LANGUAGE_OPTIONS}
                value={[draft.language]}
                onUpdate={([value]) => value && update('language', value)}
              />
            </Field>

            <Field id="profile-timezone" label="Часовой пояс">
              <Select
                id="profile-timezone"
                size="l"
                width="max"
                filterable
                filterPlaceholder="Поиск"
                options={TIMEZONE_OPTIONS}
                value={[draft.timezone]}
                onUpdate={([value]) => value && update('timezone', value)}
              />
            </Field>
          </Flex>
        </Card>

        <Card type="container" view="outlined" size="l">
          <Flex direction="column" gap={5}>
            <Text variant="header-2">Безопасность</Text>

            <Flex alignItems="center" justifyContent="space-between" gap={4}>
              <Flex direction="column" gap={1} grow style={{minWidth: 0}}>
                <Text variant="subheader-1" id="two-factor-label">
                  Двухфакторная авторизация
                </Text>
                <Text variant="body-1" color="secondary">
                  Запрашивать код подтверждения при входе в аккаунт
                </Text>
              </Flex>
              <Switch
                size="l"
                checked={draft.twoFactor}
                onUpdate={(checked) => update('twoFactor', checked)}
                controlProps={{'aria-labelledby': 'two-factor-label'}}
                style={{flexShrink: 0}}
              />
            </Flex>
          </Flex>
        </Card>

        <Card type="container" view="outlined" size="l">
          <Flex direction="column" gap={4}>
            <Text variant="header-2">Email-уведомления</Text>
            <Flex direction="column" gap={3} role="group" aria-label="Email-уведомления">
              {NOTIFICATION_OPTIONS.map(({key, label}) => (
                <Checkbox
                  key={key}
                  size="l"
                  checked={draft.notifications[key]}
                  onUpdate={(checked) => updateNotification(key, checked)}
                >
                  {label}
                </Checkbox>
              ))}
            </Flex>
          </Flex>
        </Card>

        <Flex alignItems="center" justifyContent="flex-end" gap={3} wrap>
          {justSaved && (
            <Text variant="body-1" color="positive" role="status">
              Изменения сохранены
            </Text>
          )}
          <Button type="reset" view="flat" size="l" disabled={saving || !isDirty}>
            Отмена
          </Button>
          <Button type="submit" view="action" size="l" loading={saving} disabled={!isDirty}>
            Сохранить
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
