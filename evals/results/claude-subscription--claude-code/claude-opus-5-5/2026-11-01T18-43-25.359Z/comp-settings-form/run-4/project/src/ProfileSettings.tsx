import * as React from 'react';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Select,
  Switch,
  Text,
  TextInput,
  useFileInput,
} from '@gravity-ui/uikit';

import {
  LANGUAGE_OPTIONS,
  NOTIFICATION_OPTIONS,
  TIMEZONE_OPTIONS,
  type NotificationKey,
} from './options';
import './ProfileSettings.css';

export interface ProfileFormValues {
  name: string;
  email: string;
  /** Object URL / remote URL of the avatar, or null if none. */
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: Record<NotificationKey, boolean>;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'avatar', string>>;

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_VALUES: ProfileFormValues = {
  name: 'Анна Смирнова',
  email: 'anna.smirnova@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifications: { productNews: true, systemAlerts: true, weeklyDigest: false },
};

function validate(values: ProfileFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'Укажите имя';
  else if (name.length > 64) errors.name = 'Не более 64 символов';

  const email = values.email.trim();
  if (!email) errors.email = 'Укажите email';
  else if (!EMAIL_RE.test(email)) errors.email = 'Некорректный email';
  return errors;
}

function isEqual(a: ProfileFormValues, b: ProfileFormValues) {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.avatarUrl === b.avatarUrl &&
    a.language === b.language &&
    a.timezone === b.timezone &&
    a.twoFactor === b.twoFactor &&
    NOTIFICATION_OPTIONS.every(({ key }) => a.notifications[key] === b.notifications[key])
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '?';
}

/** Stand-in for a real API call. */
function saveProfile(values: ProfileFormValues) {
  return new Promise<ProfileFormValues>((resolve) => setTimeout(() => resolve(values), 700));
}

export function ProfileSettings({ initialValues = DEFAULT_VALUES }: { initialValues?: ProfileFormValues }) {
  const [saved, setSaved] = React.useState(initialValues);
  const [draft, setDraft] = React.useState(initialValues);
  const [submitted, setSubmitted] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState<string>();
  const [saving, setSaving] = React.useState(false);
  const [justSaved, setJustSaved] = React.useState(false);

  // Track object URLs we created so they can be released.
  const savedRef = React.useRef(saved);
  savedRef.current = saved;
  const createdUrls = React.useRef(new Set<string>());
  const releaseUrl = React.useCallback((url: string | null) => {
    if (url && createdUrls.current.has(url) && url !== savedRef.current.avatarUrl) {
      URL.revokeObjectURL(url);
      createdUrls.current.delete(url);
    }
  }, []);
  React.useEffect(
    () => () => {
      createdUrls.current.forEach((url) => URL.revokeObjectURL(url));
      createdUrls.current.clear();
    },
    [],
  );

  const errors = submitted ? validate(draft) : {};
  const dirty = !isEqual(draft, saved);

  const update = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setJustSaved(false);
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const setNotification = (key: NotificationKey, checked: boolean) =>
    update('notifications', { ...draft.notifications, [key]: checked });

  const onAvatarFiles = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (!AVATAR_TYPES.includes(file.type)) {
        setAvatarError('Поддерживаются только JPG, PNG и WebP');
        return;
      }
      if (file.size > AVATAR_MAX_SIZE) {
        setAvatarError('Файл больше 5 МБ');
        return;
      }
      setAvatarError(undefined);
      const url = URL.createObjectURL(file);
      createdUrls.current.add(url);
      setJustSaved(false);
      setDraft((prev) => {
        releaseUrl(prev.avatarUrl);
        return { ...prev, avatarUrl: url };
      });
    },
    [releaseUrl],
  );
  const { controlProps: fileControlProps, triggerProps: fileTriggerProps } = useFileInput({
    onUpdate: onAvatarFiles,
  });

  const removeAvatar = () => {
    setAvatarError(undefined);
    releaseUrl(draft.avatarUrl);
    update('avatarUrl', null);
  };

  const handleCancel = () => {
    releaseUrl(draft.avatarUrl);
    setDraft(saved);
    setSubmitted(false);
    setAvatarError(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validate(draft)).length > 0 || !dirty) return;

    setSaving(true);
    try {
      const next = await saveProfile({ ...draft, name: draft.name.trim(), email: draft.email.trim() });
      const prevUrl = saved.avatarUrl;
      setSaved(next);
      setDraft(next);
      savedRef.current = next;
      if (prevUrl !== next.avatarUrl) releaseUrl(prevUrl);
      setSubmitted(false);
      setJustSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-settings">
      <Text as="h1" variant="header-2" style={{ margin: '0 0 4px' }}>
        Настройки профиля
      </Text>
      <Text as="p" color="secondary" style={{ margin: '0 0 20px' }}>
        Личные данные, безопасность и уведомления
      </Text>

      <Card view="outlined" className="profile-settings__card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Профиль */}
          <section className="profile-settings__section" aria-labelledby="ps-profile">
            <Text as="h2" variant="subheader-3" id="ps-profile" style={{ margin: 0 }}>
              Профиль
            </Text>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {draft.avatarUrl ? (
                <Avatar size="xl" imgUrl={draft.avatarUrl} alt="Аватар" />
              ) : (
                <Avatar size="xl" text={getInitials(draft.name)} theme="brand" aria-label="Аватар" />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input {...fileControlProps} accept={AVATAR_TYPES.join(',')} aria-label="Файл аватара" />
                  <Button view="outlined" {...fileTriggerProps}>
                    {draft.avatarUrl ? 'Заменить фото' : 'Загрузить фото'}
                  </Button>
                  {draft.avatarUrl && (
                    <Button view="flat-danger" onClick={removeAvatar}>
                      Удалить
                    </Button>
                  )}
                </div>
                <Text variant="caption-2" color={avatarError ? 'danger' : 'secondary'} role={avatarError ? 'alert' : undefined}>
                  {avatarError ?? 'JPG, PNG или WebP, не больше 5 МБ'}
                </Text>
              </div>
            </div>

            <div className="profile-settings__row">
              <div className="profile-settings__field">
                <Text as="label" htmlFor="ps-name" variant="subheader-1">
                  Имя
                </Text>
                <TextInput
                  id="ps-name"
                  size="l"
                  value={draft.name}
                  onUpdate={(v) => update('name', v)}
                  autoComplete="name"
                  placeholder="Как к вам обращаться"
                  validationState={errors.name ? 'invalid' : undefined}
                  errorMessage={errors.name}
                />
              </div>
              <div className="profile-settings__field">
                <Text as="label" htmlFor="ps-email" variant="subheader-1">
                  Email
                </Text>
                <TextInput
                  id="ps-email"
                  type="email"
                  size="l"
                  value={draft.email}
                  onUpdate={(v) => update('email', v)}
                  autoComplete="email"
                  placeholder="name@example.com"
                  validationState={errors.email ? 'invalid' : undefined}
                  errorMessage={errors.email}
                />
              </div>
            </div>
          </section>

          {/* Регион */}
          <section className="profile-settings__section" aria-labelledby="ps-region">
            <Text as="h2" variant="subheader-3" id="ps-region" style={{ margin: 0 }}>
              Язык и регион
            </Text>
            <div className="profile-settings__row">
              <div className="profile-settings__field">
                <Text as="label" id="ps-language-label" variant="subheader-1">
                  Язык интерфейса
                </Text>
                <Select
                  size="l"
                  width="max"
                  aria-labelledby="ps-language-label"
                  options={LANGUAGE_OPTIONS}
                  value={[draft.language]}
                  onUpdate={([v]) => v && update('language', v)}
                />
              </div>
              <div className="profile-settings__field">
                <Text as="label" id="ps-timezone-label" variant="subheader-1">
                  Часовой пояс
                </Text>
                <Select
                  size="l"
                  width="max"
                  filterable
                  filterPlaceholder="Поиск города или UTC"
                  aria-labelledby="ps-timezone-label"
                  options={TIMEZONE_OPTIONS}
                  value={[draft.timezone]}
                  onUpdate={([v]) => v && update('timezone', v)}
                />
              </div>
            </div>
          </section>

          {/* Безопасность */}
          <section className="profile-settings__section" aria-labelledby="ps-security">
            <Text as="h2" variant="subheader-3" id="ps-security" style={{ margin: 0 }}>
              Безопасность
            </Text>
            <div className="profile-settings__switch-row">
              <div>
                <Text as="div" variant="body-2" id="ps-2fa-label">
                  Двухфакторная авторизация
                </Text>
                <Text as="div" color="secondary" id="ps-2fa-hint">
                  При входе дополнительно запрашивать код из приложения-аутентификатора
                </Text>
              </div>
              <Switch
                size="l"
                checked={draft.twoFactor}
                onUpdate={(v) => update('twoFactor', v)}
                controlProps={{ 'aria-labelledby': 'ps-2fa-label', 'aria-describedby': 'ps-2fa-hint' }}
              />
            </div>
          </section>

          {/* Уведомления */}
          <section className="profile-settings__section" aria-labelledby="ps-notifications">
            <Text as="h2" variant="subheader-3" id="ps-notifications" style={{ margin: 0 }}>
              Email-уведомления
            </Text>
            <div role="group" aria-labelledby="ps-notifications" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {NOTIFICATION_OPTIONS.map(({ key, label, hint }) => (
                <Checkbox
                  key={key}
                  size="l"
                  checked={draft.notifications[key]}
                  onUpdate={(checked) => setNotification(key, checked)}
                >
                  {label}
                  <Text color="secondary" variant="caption-2" className="profile-settings__checkbox-hint">
                    {hint}
                  </Text>
                </Checkbox>
              ))}
            </div>
          </section>

          <div className="profile-settings__footer">
            <Text className="profile-settings__status" color={justSaved ? 'positive' : 'secondary'} aria-live="polite">
              {justSaved ? 'Изменения сохранены' : dirty ? 'Есть несохранённые изменения' : ''}
            </Text>
            <Button size="l" view="flat" onClick={handleCancel} disabled={!dirty || saving}>
              Отмена
            </Button>
            <Button size="l" view="action" type="submit" loading={saving} disabled={!dirty}>
              Сохранить
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
