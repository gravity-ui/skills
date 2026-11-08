import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import {
  Alert,
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

import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  INITIAL_PROFILE,
  LANGUAGE_OPTIONS,
  TIMEZONE_IDS,
  formatTimezoneLabel,
  saveProfile,
  validateProfile,
} from './profileData';
import type { NotificationKey, ProfileErrors, ProfileValues } from './profileData';

const TIMEZONE_OPTIONS = TIMEZONE_IDS.map((tz) => {
  const label = formatTimezoneLabel(tz);
  return { value: tz, text: label, content: label };
});

const NOTIFICATION_ITEMS: { key: NotificationKey; label: string }[] = [
  { key: 'productNews', label: 'Новости продукта' },
  { key: 'systemAlerts', label: 'Системные алерты' },
  { key: 'weeklyDigest', label: 'Дайджест за неделю' },
];

type TouchableField = keyof ProfileErrors;

export interface ProfileSettingsProps {
  initialValues?: ProfileValues;
  onSave?: (values: ProfileValues) => Promise<void>;
}

export function ProfileSettings({
  initialValues = INITIAL_PROFILE,
  onSave = saveProfile,
}: ProfileSettingsProps) {
  // `saved` — последнее сохранённое состояние, `draft` — то, что редактирует пользователь.
  const [saved, setSaved] = useState<ProfileValues>(initialValues);
  const [draft, setDraft] = useState<ProfileValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<TouchableField, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const errors = validateProfile(draft);
  const isValid = Object.keys(errors).length === 0;
  const isDirty = hasChanges(saved, draft);

  const updateDraft = (patch: Partial<ProfileValues>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setSaveSucceeded(false);
    setSaveError(null);
  };

  const markTouched = (field: TouchableField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const fieldError = (field: TouchableField) => (touched[field] ? errors[field] : undefined);

  const handleCancel = () => {
    setDraft(saved);
    setTouched({});
    setSaveError(null);
    setSaveSucceeded(false);
    setAvatarError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setTouched({ name: true, email: true });
      return;
    }
    if (!isDirty) return;

    setSubmitting(true);
    setSaveError(null);
    setSaveSucceeded(false);
    try {
      await onSave(draft);
      // Файл считается сохранённым: дальше он — уже текущий аватар, а не pending-загрузка.
      const committed = { ...draft, avatarFile: null };
      setSaved(committed);
      setDraft(committed);
      setSaveSucceeded(true);
    } catch {
      setSaveError('Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Сбрасываем значение input, чтобы можно было выбрать тот же файл повторно.
    event.target.value = '';
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Допустимые форматы: PNG, JPEG, WebP');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError('Размер файла не должен превышать 2 МБ');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarError(null);
      updateDraft({ avatarUrl: dataUrl, avatarFile: file });
    } catch {
      setAvatarError('Не удалось прочитать файл');
    }
  };

  const handleAvatarRemove = () => {
    setAvatarError(null);
    updateDraft({ avatarUrl: null, avatarFile: null });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={submitting} style={resetFieldsetStyle}>
        <Flex direction="column" gap={5} style={{ maxWidth: 640, padding: 24 }}>
          <Text as="h1" variant="header-2">
            Настройки профиля
          </Text>

          {/* Аватар */}
          <Flex direction="column" gap={2}>
            <Text as="span" variant="subheader-1">
              Аватар
            </Text>
            <Flex alignItems="center" gap={4}>
              {draft.avatarUrl ? (
                <Avatar size="xl" imgUrl={draft.avatarUrl} alt="Аватар пользователя" />
              ) : (
                <Avatar size="xl" text={getInitials(draft.name)} />
              )}
              <Flex direction="column" gap={2}>
                <Flex gap={2}>
                  <Button
                    type="button"
                    view="outlined"
                    size="m"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Загрузить
                  </Button>
                  <Button
                    type="button"
                    view="flat-danger"
                    size="m"
                    disabled={!draft.avatarUrl}
                    onClick={handleAvatarRemove}
                  >
                    Удалить
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={AVATAR_TYPES.join(',')}
                    aria-label="Выбрать файл аватара"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </Flex>
                <Text variant="caption-1" color={avatarError ? 'danger' : 'secondary'}>
                  {avatarError ?? 'PNG, JPEG или WebP, до 2 МБ'}
                </Text>
              </Flex>
            </Flex>
          </Flex>

          {/* Основные поля */}
          <Field id="profile-name" label="Имя">
            <TextInput
              id="profile-name"
              name="name"
              autoComplete="name"
              value={draft.name}
              onUpdate={(value) => updateDraft({ name: value })}
              onBlur={() => markTouched('name')}
              validationState={fieldError('name') ? 'invalid' : undefined}
              errorMessage={fieldError('name')}
            />
          </Field>

          <Field id="profile-email" label="Email">
            <TextInput
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              value={draft.email}
              onUpdate={(value) => updateDraft({ email: value })}
              onBlur={() => markTouched('email')}
              validationState={fieldError('email') ? 'invalid' : undefined}
              errorMessage={fieldError('email')}
            />
          </Field>

          <Field id="profile-language" label="Язык интерфейса">
            <Select
              id="profile-language"
              width="max"
              value={[draft.language]}
              onUpdate={([language]) => language && updateDraft({ language })}
              options={LANGUAGE_OPTIONS.map((o) => ({ value: o.value, text: o.label, content: o.label }))}
            />
          </Field>

          <Field id="profile-timezone" label="Часовой пояс">
            <Select
              id="profile-timezone"
              width="max"
              filterable
              value={[draft.timezone]}
              onUpdate={([timezone]) => timezone && updateDraft({ timezone })}
              options={TIMEZONE_OPTIONS}
            />
          </Field>

          <Divider />

          {/* Безопасность */}
          <Flex direction="column" gap={1}>
            <Switch
              checked={draft.twoFactorEnabled}
              onUpdate={(checked) => updateDraft({ twoFactorEnabled: checked })}
            >
              Двухфакторная аутентификация
            </Switch>
            <Text variant="caption-1" color="secondary">
              При входе будет запрашиваться код из приложения-аутентификатора.
            </Text>
          </Flex>

          {/* Уведомления */}
          <Flex direction="column" gap={2}>
            <Text as="span" variant="subheader-1" id="profile-notifications-label">
              Email-уведомления
            </Text>
            <div role="group" aria-labelledby="profile-notifications-label">
              <Flex direction="column" gap={2}>
                {NOTIFICATION_ITEMS.map((item) => (
                  <Checkbox
                    key={item.key}
                    checked={draft.notifications[item.key]}
                    onUpdate={(checked) =>
                      updateDraft({
                        notifications: { ...draft.notifications, [item.key]: checked },
                      })
                    }
                  >
                    {item.label}
                  </Checkbox>
                ))}
              </Flex>
            </div>
          </Flex>

          <Divider />

          {saveSucceeded && (
            <Alert
              theme="success"
              message="Изменения сохранены"
              onClose={() => setSaveSucceeded(false)}
            />
          )}
          {saveError && <Alert theme="danger" message={saveError} />}

          {/* Кнопки */}
          <Flex justifyContent="flex-end" gap={2}>
            <Button
              type="button"
              view="outlined"
              size="l"
              disabled={!isDirty}
              onClick={handleCancel}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              view="action"
              size="l"
              disabled={!isDirty}
              loading={submitting}
            >
              Сохранить
            </Button>
          </Flex>
        </Flex>
      </fieldset>
    </form>
  );
}

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

const resetFieldsetStyle = { border: 0, margin: 0, padding: 0, minWidth: 0 } as const;

function hasChanges(a: ProfileValues, b: ProfileValues): boolean {
  return (
    a.name !== b.name ||
    a.email !== b.email ||
    a.language !== b.language ||
    a.timezone !== b.timezone ||
    a.twoFactorEnabled !== b.twoFactorEnabled ||
    a.avatarUrl !== b.avatarUrl ||
    a.avatarFile !== b.avatarFile ||
    a.notifications.productNews !== b.notifications.productNews ||
    a.notifications.systemAlerts !== b.notifications.systemAlerts ||
    a.notifications.weeklyDigest !== b.notifications.weeklyDigest
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
