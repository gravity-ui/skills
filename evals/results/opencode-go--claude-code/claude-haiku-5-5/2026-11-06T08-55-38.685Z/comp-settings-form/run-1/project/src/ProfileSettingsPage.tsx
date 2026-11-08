import { useId, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, FormEvent, ReactNode } from 'react';
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

export interface NotificationSettings {
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
}

export interface ProfileData {
  name: string;
  email: string;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: NotificationSettings;
}

export interface ProfileSettingsPageProps {
  initialProfile: ProfileData;
  initialAvatarUrl?: string | null;
  /** Persists the profile. `avatarFile` is non-null only when a new avatar was picked. */
  onSave: (profile: ProfileData, avatarFile: File | null) => Promise<void>;
}

const LANGUAGE_OPTIONS = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
];

const TIMEZONE_FALLBACK = [
  'UTC',
  'Europe/Kaliningrad',
  'Europe/Moscow',
  'Europe/Berlin',
  'Asia/Yekaterinburg',
  'Asia/Shanghai',
  'America/New_York',
  'America/Los_Angeles',
];

function listTimezones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return TIMEZONE_FALLBACK;
  }
}

const TIMEZONE_OPTIONS = listTimezones().map((tz) => ({ value: tz, content: tz }));

const NAME_MAX_LENGTH = 80;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

type TextField = 'name' | 'email';
type FieldErrors = Partial<Record<TextField, string>>;

function validateProfile(profile: ProfileData): FieldErrors {
  const errors: FieldErrors = {};
  const name = profile.name.trim();
  const email = profile.email.trim();

  if (!name) {
    errors.name = 'Введите имя';
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Не больше ${NAME_MAX_LENGTH} символов`;
  }

  if (!email) {
    errors.email = 'Введите email';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Некорректный email';
  }

  return errors;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const fieldsetReset: CSSProperties = { border: 0, margin: 0, padding: 0, minWidth: 0 };

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <Flex direction="column" gap={2}>
      <Text as="label" htmlFor={id} variant="subheader-1">
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export function ProfileSettingsPage({
  initialProfile,
  initialAvatarUrl = null,
  onSave,
}: ProfileSettingsPageProps) {
  // `saved` is the last persisted state; `draft` is what the form currently shows.
  const [saved, setSaved] = useState<ProfileData>(initialProfile);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [draft, setDraft] = useState<ProfileData>(initialProfile);
  const [avatarDraft, setAvatarDraft] = useState<{ file: File; dataUrl: string } | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [touched, setTouched] = useState<Partial<Record<TextField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSavedNotice, setShowSavedNotice] = useState(false);

  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const errors = validateProfile(draft);
  const fieldError = (field: TextField) =>
    submitted || touched[field] ? errors[field] : undefined;
  const isDirty =
    avatarDraft !== null || JSON.stringify(draft) !== JSON.stringify(saved);

  const avatarPreview = avatarDraft?.dataUrl ?? savedAvatarUrl;

  function edit(change: (profile: ProfileData) => ProfileData) {
    setDraft(change);
    setSaveError(null);
    setShowSavedNotice(false);
  }

  function touch(field: TextField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so that selecting the same file again still fires onChange.
    event.target.value = '';
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Допустимы форматы PNG, JPEG, WebP или GIF');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError('Файл больше 2 МБ');
      return;
    }

    try {
      const dataUrl = await readAsDataUrl(file);
      setAvatarError(null);
      setAvatarDraft({ file, dataUrl });
      setShowSavedNotice(false);
    } catch {
      setAvatarError('Не удалось прочитать файл');
    }
  }

  function handleCancel() {
    setDraft(saved);
    setAvatarDraft(null);
    setAvatarError(null);
    setTouched({});
    setSubmitted(false);
    setSaveError(null);
    setShowSavedNotice(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    const profile: ProfileData = {
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim(),
    };
    const newAvatar = avatarDraft;

    setSaving(true);
    setSaveError(null);
    setShowSavedNotice(false);
    try {
      await onSave(profile, newAvatar?.file ?? null);
      setSaved(profile);
      setDraft(profile);
      if (newAvatar) setSavedAvatarUrl(newAvatar.dataUrl);
      setAvatarDraft(null);
      setTouched({});
      setSubmitted(false);
      setShowSavedNotice(true);
    } catch {
      setSaveError('Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  }

  const avatarLabel = draft.name.trim() || '?';

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 640, padding: 24 }}>
      <Flex direction="column" gap={6}>
        <Text as="h1" variant="header-1">
          Настройки профиля
        </Text>

        {/* Disabling the whole block while saving prevents edits from racing the request. */}
        <fieldset disabled={saving} style={fieldsetReset}>
          <Flex direction="column" gap={6}>
            <Flex alignItems="center" gap={4}>
              {avatarPreview ? (
                <Avatar size="xl" imgUrl={avatarPreview} alt="Аватар" />
              ) : (
                <Avatar size="xl" text={avatarLabel} />
              )}
              <Flex direction="column" gap={2} alignItems="flex-start">
                <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
                  Загрузить аватар
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={AVATAR_TYPES.join(',')}
                  hidden
                  onChange={handleAvatarChange}
                />
                <Text variant="caption-1" color="secondary">
                  PNG, JPEG, WebP или GIF, до 2 МБ
                </Text>
                {avatarError && (
                  <Text variant="caption-1" color="danger">
                    {avatarError}
                  </Text>
                )}
              </Flex>
            </Flex>

            <Field id={fieldId('name')} label="Имя">
              <TextInput
                id={fieldId('name')}
                value={draft.name}
                autoComplete="name"
                onUpdate={(name) => edit((p) => ({ ...p, name }))}
                onBlur={() => touch('name')}
                validationState={fieldError('name') ? 'invalid' : undefined}
                errorMessage={fieldError('name')}
              />
            </Field>

            <Field id={fieldId('email')} label="Email">
              <TextInput
                id={fieldId('email')}
                type="email"
                value={draft.email}
                autoComplete="email"
                onUpdate={(email) => edit((p) => ({ ...p, email }))}
                onBlur={() => touch('email')}
                validationState={fieldError('email') ? 'invalid' : undefined}
                errorMessage={fieldError('email')}
              />
            </Field>

            <Field id={fieldId('language')} label="Язык интерфейса">
              <Select
                id={fieldId('language')}
                width="max"
                options={LANGUAGE_OPTIONS}
                value={[draft.language]}
                onUpdate={([language]) => {
                  if (language) edit((p) => ({ ...p, language }));
                }}
              />
            </Field>

            <Field id={fieldId('timezone')} label="Часовой пояс">
              <Select
                id={fieldId('timezone')}
                width="max"
                filterable
                options={TIMEZONE_OPTIONS}
                value={[draft.timezone]}
                onUpdate={([timezone]) => {
                  if (timezone) edit((p) => ({ ...p, timezone }));
                }}
              />
            </Field>

            <Flex direction="column" gap={1}>
              <Switch
                size="l"
                checked={draft.twoFactorEnabled}
                onUpdate={(twoFactorEnabled) => edit((p) => ({ ...p, twoFactorEnabled }))}
              >
                Двухфакторная аутентификация
              </Switch>
              <Text variant="caption-1" color="secondary">
                При входе дополнительно запрашивать код из приложения-аутентификатора
              </Text>
            </Flex>

            <Flex direction="column" gap={2}>
              <Text id={fieldId('notifications')} variant="subheader-1">
                Email-уведомления
              </Text>
              <Flex
                direction="column"
                gap={2}
                role="group"
                aria-labelledby={fieldId('notifications')}
              >
                <Checkbox
                  checked={draft.notifications.productNews}
                  onUpdate={(productNews) =>
                    edit((p) => ({ ...p, notifications: { ...p.notifications, productNews } }))
                  }
                >
                  Новости продукта
                </Checkbox>
                <Checkbox
                  checked={draft.notifications.systemAlerts}
                  onUpdate={(systemAlerts) =>
                    edit((p) => ({ ...p, notifications: { ...p.notifications, systemAlerts } }))
                  }
                >
                  Системные алерты
                </Checkbox>
                <Checkbox
                  checked={draft.notifications.weeklyDigest}
                  onUpdate={(weeklyDigest) =>
                    edit((p) => ({ ...p, notifications: { ...p.notifications, weeklyDigest } }))
                  }
                >
                  Дайджест за неделю
                </Checkbox>
              </Flex>
            </Flex>
          </Flex>
        </fieldset>

        <Divider />

        <Flex justifyContent="space-between" alignItems="center" gap={4}>
          <div aria-live="polite" style={{ minHeight: 20 }}>
            {saveError ? (
              <Text color="danger">{saveError}</Text>
            ) : showSavedNotice ? (
              <Text color="positive">Изменения сохранены</Text>
            ) : null}
          </div>
          <Flex gap={2}>
            <Button
              type="button"
              view="outlined"
              size="l"
              disabled={!isDirty || saving}
              onClick={handleCancel}
            >
              Отмена
            </Button>
            <Button type="submit" view="action" size="l" disabled={!isDirty} loading={saving}>
              Сохранить
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
