import React from 'react';
import {
  Avatar,
  Button,
  Checkbox,
  Divider,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

import './App.css';

type Notifications = {
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
};

type ProfileSettings = {
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
  {value: 'fr', content: 'Français'},
  {value: 'es', content: 'Español'},
];

const TIMEZONES = [
  {value: 'Europe/Kaliningrad', content: '(UTC+2) Калининград'},
  {value: 'Europe/Moscow', content: '(UTC+3) Москва'},
  {value: 'Europe/Samara', content: '(UTC+4) Самара'},
  {value: 'Asia/Yekaterinburg', content: '(UTC+5) Екатеринбург'},
  {value: 'Asia/Omsk', content: '(UTC+6) Омск'},
  {value: 'Asia/Novosibirsk', content: '(UTC+7) Новосибирск'},
  {value: 'Asia/Irkutsk', content: '(UTC+8) Иркутск'},
  {value: 'Asia/Yakutsk', content: '(UTC+9) Якутск'},
  {value: 'Asia/Vladivostok', content: '(UTC+10) Владивосток'},
  {value: 'Asia/Magadan', content: '(UTC+11) Магадан'},
  {value: 'Asia/Kamchatka', content: '(UTC+12) Камчатка'},
  {value: 'Europe/London', content: '(UTC+0) Лондон'},
  {value: 'Europe/Berlin', content: '(UTC+1) Берлин'},
  {value: 'America/New_York', content: '(UTC−5) Нью-Йорк'},
  {value: 'America/Los_Angeles', content: '(UTC−8) Лос-Анджелес'},
];

const INITIAL_SETTINGS: ProfileSettings = {
  name: 'Анна Иванова',
  email: 'anna.ivanova@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function validateName(name: string): string | undefined {
  return name.trim() ? undefined : 'Введите имя';
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return 'Введите email';
  }
  return EMAIL_RE.test(email.trim()) ? undefined : 'Введите корректный email';
}

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
};

function Field({label, htmlFor, hint, children}: FieldProps) {
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

type SectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function Section({title, description, children}: SectionProps) {
  return (
    <Flex direction="column" gap={4}>
      <Flex direction="column" gap={1}>
        <Text variant="header-2">{title}</Text>
        {description ? (
          <Text variant="body-1" color="secondary">
            {description}
          </Text>
        ) : null}
      </Flex>
      {children}
    </Flex>
  );
}

export function App() {
  const [saved, setSaved] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
  const [values, setValues] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
  const [touched, setTouched] = React.useState({name: false, email: false});
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Blob-URL'ы, созданные для превью аватара, освобождаем при смене и размонтировании.
  const blobUrls = React.useRef<string[]>([]);
  React.useEffect(() => {
    const urls = blobUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const nameError = validateName(values.name);
  const emailError = validateEmail(values.email);
  const isDirty = JSON.stringify(values) !== JSON.stringify(saved);
  const isValid = !nameError && !emailError;

  const patch = (next: Partial<ProfileSettings>) => setValues((prev) => ({...prev, ...next}));

  const patchNotification = (key: keyof Notifications) => (checked: boolean) =>
    setValues((prev) => ({
      ...prev,
      notifications: {...prev.notifications, [key]: checked},
    }));

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // позволяет выбрать тот же файл повторно
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarError('Выберите файл изображения (PNG, JPG, WebP)');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Размер файла не должен превышать 5 МБ');
      return;
    }
    setAvatarError(null);
    const url = URL.createObjectURL(file);
    blobUrls.current.push(url);
    patch({avatarUrl: url});
  };

  const handleRemoveAvatar = () => {
    setAvatarError(null);
    patch({avatarUrl: null});
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({name: true, email: true});
    if (!isValid) {
      return;
    }
    setSaving(true);
    // Заглушка запроса на сервер.
    await new Promise((resolve) => setTimeout(resolve, 600));
    const next = {...values, name: values.name.trim(), email: values.email.trim()};
    setSaved(next);
    setValues(next);
    setSaving(false);
  };

  const handleCancel = () => {
    setValues(saved);
    setTouched({name: false, email: false});
    setAvatarError(null);
  };

  const showNameError = touched.name && nameError;
  const showEmailError = touched.email && emailError;

  return (
    <div className="profile-settings">
      <form className="profile-settings__form" onSubmit={handleSubmit} noValidate>
        <Flex direction="column" gap={6}>
          <Text variant="header-1">Настройки профиля</Text>

          <Section title="Основное">
            <Flex gap={4} alignItems="center">
              {values.avatarUrl ? (
                <Avatar
                  size="xl"
                  imgUrl={values.avatarUrl}
                  alt={values.name}
                  title={values.name}
                  className="profile-settings__avatar"
                />
              ) : (
                <Avatar
                  size="xl"
                  text={values.name.trim() || '?'}
                  title={values.name}
                  className="profile-settings__avatar"
                />
              )}
              <Flex direction="column" gap={2} className="profile-settings__avatar-actions">
                <Flex gap={2} wrap>
                  <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
                    Загрузить фото
                  </Button>
                  {values.avatarUrl ? (
                    <Button view="flat-danger" onClick={handleRemoveAvatar}>
                      Удалить
                    </Button>
                  ) : null}
                </Flex>
                <Text
                  variant="caption-2"
                  color={avatarError ? 'danger' : 'secondary'}
                  role={avatarError ? 'alert' : undefined}
                >
                  {avatarError ?? 'PNG, JPG или WebP, до 5 МБ'}
                </Text>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={handleFileChange}
                  aria-label="Загрузить аватар"
                />
              </Flex>
            </Flex>

            <Field label="Имя" htmlFor="profile-name">
              <TextInput
                id="profile-name"
                size="l"
                value={values.name}
                onUpdate={(name) => patch({name})}
                onBlur={() => setTouched((prev) => ({...prev, name: true}))}
                placeholder="Как к вам обращаться"
                autoComplete="name"
                validationState={showNameError ? 'invalid' : undefined}
                errorMessage={showNameError ? nameError : undefined}
                errorPlacement="outside"
              />
            </Field>

            <Field label="Email" htmlFor="profile-email">
              <TextInput
                id="profile-email"
                type="email"
                size="l"
                value={values.email}
                onUpdate={(email) => patch({email})}
                onBlur={() => setTouched((prev) => ({...prev, email: true}))}
                placeholder="name@example.com"
                autoComplete="email"
                validationState={showEmailError ? 'invalid' : undefined}
                errorMessage={showEmailError ? emailError : undefined}
                errorPlacement="outside"
              />
            </Field>
          </Section>

          <Divider />

          <Section title="Региональные настройки">
            <Field label="Язык интерфейса" htmlFor="profile-language">
              <Select
                id="profile-language"
                size="l"
                width="max"
                value={[values.language]}
                options={LANGUAGES}
                onUpdate={([language]) => patch({language})}
              />
            </Field>

            <Field label="Часовой пояс" htmlFor="profile-timezone">
              <Select
                id="profile-timezone"
                size="l"
                width="max"
                filterable
                filterPlaceholder="Поиск по городу"
                value={[values.timezone]}
                options={TIMEZONES}
                onUpdate={([timezone]) => patch({timezone})}
              />
            </Field>
          </Section>

          <Divider />

          <Section title="Безопасность">
            <Flex gap={4} alignItems="center" justifyContent="space-between">
              <Flex direction="column" gap={1} className="profile-settings__grow">
                <Text variant="subheader-1" id="profile-2fa-label">
                  Двухфакторная авторизация
                </Text>
                <Text variant="body-1" color="secondary">
                  Запрашивать одноразовый код при входе в аккаунт
                </Text>
              </Flex>
              <Switch
                size="l"
                checked={values.twoFactor}
                onUpdate={(twoFactor) => patch({twoFactor})}
                controlProps={{'aria-labelledby': 'profile-2fa-label'}}
              />
            </Flex>
          </Section>

          <Divider />

          <Section title="Email-уведомления">
            <Flex direction="column" gap={3} role="group">
              <Checkbox
                size="l"
                checked={values.notifications.productNews}
                onUpdate={patchNotification('productNews')}
                content="Новости продукта"
              />
              <Checkbox
                size="l"
                checked={values.notifications.systemAlerts}
                onUpdate={patchNotification('systemAlerts')}
                content="Системные алерты"
              />
              <Checkbox
                size="l"
                checked={values.notifications.weeklyDigest}
                onUpdate={patchNotification('weeklyDigest')}
                content="Дайджест за неделю"
              />
            </Flex>
          </Section>

          <Divider />

          <Flex gap={2} justifyContent="flex-end" wrap>
            <Button view="flat" size="l" onClick={handleCancel} disabled={saving || !isDirty}>
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
      </form>
    </div>
  );
}
