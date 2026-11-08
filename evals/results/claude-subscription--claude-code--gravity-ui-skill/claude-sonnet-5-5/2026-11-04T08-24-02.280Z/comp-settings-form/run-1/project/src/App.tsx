import React from 'react';
import {Avatar, Box, Button, Card, Checkbox, Flex, Select, Switch, Text, TextInput} from '@gravity-ui/uikit';

type Notifications = {
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
};

type Settings = {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: Notifications;
};

const LANGUAGES = [
  {value: 'ru', content: 'Русский'},
  {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'},
  {value: 'es', content: 'Español'},
  {value: 'fr', content: 'Français'},
];

const TIMEZONES = [
  {value: 'Europe/Kaliningrad', content: 'Калининград (UTC+2)'},
  {value: 'Europe/Moscow', content: 'Москва (UTC+3)'},
  {value: 'Europe/Samara', content: 'Самара (UTC+4)'},
  {value: 'Asia/Yekaterinburg', content: 'Екатеринбург (UTC+5)'},
  {value: 'Asia/Omsk', content: 'Омск (UTC+6)'},
  {value: 'Asia/Novosibirsk', content: 'Новосибирск (UTC+7)'},
  {value: 'Asia/Irkutsk', content: 'Иркутск (UTC+8)'},
  {value: 'Asia/Yakutsk', content: 'Якутск (UTC+9)'},
  {value: 'Asia/Vladivostok', content: 'Владивосток (UTC+10)'},
  {value: 'Asia/Kamchatka', content: 'Камчатка (UTC+12)'},
  {value: 'UTC', content: 'UTC'},
];

const NOTIFICATION_OPTIONS: {key: keyof Notifications; label: string}[] = [
  {key: 'productNews', label: 'Новости продукта'},
  {key: 'systemAlerts', label: 'Системные алерты'},
  {key: 'weeklyDigest', label: 'Дайджест за неделю'},
];

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_SETTINGS: Settings = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifications: {productNews: true, systemAlerts: true, weeklyDigest: false},
};

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="column" gap={1}>
      <Text as="label" variant="subheader-1" htmlFor={htmlFor}>
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export function App() {
  const [saved, setSaved] = React.useState<Settings>(INITIAL_SETTINGS);
  const [draft, setDraft] = React.useState<Settings>(INITIAL_SETTINGS);
  const [submitted, setSubmitted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Object URLs created for avatar previews, revoked on unmount.
  const objectUrls = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setJustSaved(false);
    setDraft((prev) => ({...prev, [key]: value}));
  };

  const updateNotification = (key: keyof Notifications, value: boolean) => {
    setJustSaved(false);
    setDraft((prev) => ({...prev, notifications: {...prev.notifications, [key]: value}}));
  };

  const nameError = draft.name.trim() ? undefined : 'Введите имя';
  const emailError = !draft.email.trim()
    ? 'Введите email'
    : EMAIL_RE.test(draft.email.trim())
      ? undefined
      : 'Некорректный email';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Выберите файл изображения');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Размер файла не должен превышать 5 МБ');
      return;
    }
    setAvatarError(null);
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    update('avatarUrl', url);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (nameError || emailError) return;
    setSaving(true);
    // Stub for a real API request.
    window.setTimeout(() => {
      setSaved(draft);
      setSaving(false);
      setSubmitted(false);
      setJustSaved(true);
    }, 600);
  };

  const handleCancel = () => {
    setDraft(saved);
    setSubmitted(false);
    setAvatarError(null);
    setJustSaved(false);
  };

  return (
    <Box spacing={{p: 5}} style={{maxWidth: 640, margin: '0 auto'}}>
      <form onSubmit={handleSubmit} noValidate>
        <Flex direction="column" gap={5}>
          <Text as="h1" variant="header-1" style={{margin: 0}}>
            Настройки профиля
          </Text>

          <Card type="container" view="outlined" spacing={{p: 5}}>
            <Flex direction="column" gap={5}>
              <Text variant="subheader-3">Профиль</Text>

              <Flex alignItems="center" gap={4}>
                <Avatar
                  size="xl"
                  imgUrl={draft.avatarUrl ?? undefined}
                  text={draft.name.trim() || '?'}
                  title={draft.name}
                  style={{flexShrink: 0}}
                />
                <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                  <Flex gap={2} wrap>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileChange}
                    />
                    <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
                      Загрузить аватар
                    </Button>
                    {draft.avatarUrl && (
                      <Button view="flat" onClick={() => update('avatarUrl', null)}>
                        Удалить
                      </Button>
                    )}
                  </Flex>
                  {avatarError ? (
                    <Text variant="caption-2" color="danger">
                      {avatarError}
                    </Text>
                  ) : (
                    <Text variant="caption-2" color="secondary">
                      JPG, PNG или GIF, до 5 МБ
                    </Text>
                  )}
                </Flex>
              </Flex>

              <Field label="Имя" htmlFor="profile-name">
                <TextInput
                  id="profile-name"
                  size="l"
                  value={draft.name}
                  onUpdate={(value) => update('name', value)}
                  autoComplete="name"
                  validationState={submitted && nameError ? 'invalid' : undefined}
                  errorMessage={submitted ? nameError : undefined}
                />
              </Field>

              <Field label="Email" htmlFor="profile-email">
                <TextInput
                  id="profile-email"
                  size="l"
                  type="email"
                  value={draft.email}
                  onUpdate={(value) => update('email', value)}
                  autoComplete="email"
                  validationState={submitted && emailError ? 'invalid' : undefined}
                  errorMessage={submitted ? emailError : undefined}
                />
              </Field>
            </Flex>
          </Card>

          <Card type="container" view="outlined" spacing={{p: 5}}>
            <Flex direction="column" gap={5}>
              <Text variant="subheader-3">Региональные настройки</Text>

              <Field label="Язык интерфейса" htmlFor="profile-language">
                <Select
                  id="profile-language"
                  size="l"
                  width="max"
                  value={[draft.language]}
                  options={LANGUAGES}
                  onUpdate={([value]) => update('language', value)}
                />
              </Field>

              <Field label="Часовой пояс" htmlFor="profile-timezone">
                <Select
                  id="profile-timezone"
                  size="l"
                  width="max"
                  filterable
                  value={[draft.timezone]}
                  options={TIMEZONES}
                  onUpdate={([value]) => update('timezone', value)}
                />
              </Field>
            </Flex>
          </Card>

          <Card type="container" view="outlined" spacing={{p: 5}}>
            <Flex direction="column" gap={5}>
              <Text variant="subheader-3">Безопасность</Text>

              <Flex alignItems="center" justifyContent="space-between" gap={4}>
                <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                  <Text as="label" variant="body-2" htmlFor="profile-2fa">
                    Двухфакторная авторизация
                  </Text>
                  <Text variant="caption-2" color="secondary">
                    Дополнительное подтверждение при входе в аккаунт
                  </Text>
                </Flex>
                <Switch
                  id="profile-2fa"
                  size="l"
                  checked={draft.twoFactor}
                  onUpdate={(checked) => update('twoFactor', checked)}
                  style={{flexShrink: 0}}
                />
              </Flex>
            </Flex>
          </Card>

          <Card type="container" view="outlined" spacing={{p: 5}}>
            <Flex
              as="fieldset"
              direction="column"
              gap={3}
              style={{border: 0, margin: 0, padding: 0, minWidth: 0}}
            >
              <Text as="legend" variant="subheader-3" style={{padding: 0, marginBottom: 'var(--g-spacing-3)'}}>
                Email-уведомления
              </Text>
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
          </Card>

          <Flex alignItems="center" gap={3} wrap>
            <Button type="submit" view="action" size="l" loading={saving}>
              Сохранить
            </Button>
            <Button view="flat" size="l" onClick={handleCancel} disabled={saving}>
              Отмена
            </Button>
            {justSaved && (
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
