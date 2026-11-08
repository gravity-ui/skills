import * as React from 'react';
import {
  Alert,
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

import { LANGUAGE_OPTIONS, TIME_ZONE_OPTIONS } from './options';
import type { EmailNotifications, ProfileSettingsSubmit, ProfileSettingsValues } from './types';
import './ProfileSettings.css';

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_IDS = {
  name: 'profile-name',
  email: 'profile-email',
  avatar: 'profile-avatar-upload',
  language: 'profile-language',
  timeZone: 'profile-timezone',
  twoFactor: 'profile-2fa',
} as const;

const NOTIFICATION_ITEMS: { key: keyof EmailNotifications; title: string; description: string }[] = [
  {
    key: 'productNews',
    title: 'Новости продукта',
    description: 'Анонсы новых функций и обновлений',
  },
  {
    key: 'systemAlerts',
    title: 'Системные алерты',
    description: 'Важные уведомления о безопасности и работе аккаунта',
  },
  {
    key: 'weeklyDigest',
    title: 'Дайджест за неделю',
    description: 'Сводка активности раз в неделю',
  },
];

type FieldErrors = Partial<Record<'name' | 'email', string>>;
type Status = { type: 'idle' } | { type: 'saving' } | { type: 'success' } | { type: 'error'; message: string };

export interface ProfileSettingsProps {
  initialValues: ProfileSettingsValues;
  /** Persists the settings and resolves with the values as stored on the server. */
  onSave: (data: ProfileSettingsSubmit) => Promise<ProfileSettingsValues>;
}

function validate(values: ProfileSettingsValues): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name) errors.name = 'Укажите имя';
  else if (name.length > 100) errors.name = 'Не длиннее 100 символов';

  if (!email) errors.email = 'Укажите email';
  else if (!EMAIL_RE.test(email)) errors.email = 'Некорректный email';

  return errors;
}

function isEqual(a: ProfileSettingsValues, b: ProfileSettingsValues): boolean {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.avatarUrl === b.avatarUrl &&
    a.language === b.language &&
    a.timeZone === b.timeZone &&
    a.twoFactorEnabled === b.twoFactorEnabled &&
    a.notifications.productNews === b.notifications.productNews &&
    a.notifications.systemAlerts === b.notifications.systemAlerts &&
    a.notifications.weeklyDigest === b.notifications.weeklyDigest
  );
}

function getInitials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length) return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
  return email.trim()[0]?.toUpperCase() ?? '?';
}

const isBlobUrl = (url: string | null): url is string => !!url && url.startsWith('blob:');

export function ProfileSettings({ initialValues, onSave }: ProfileSettingsProps) {
  const [saved, setSaved] = React.useState(initialValues);
  const [values, setValues] = React.useState(initialValues);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [status, setStatus] = React.useState<Status>({ type: 'idle' });

  const errors = submitAttempted ? validate(values) : {};
  const isDirty = !isEqual(values, saved);
  const isSaving = status.type === 'saving';

  // Revoke a local preview URL once nothing references it anymore.
  const releasePreview = (url: string | null, keep: (string | null)[] = []) => {
    if (isBlobUrl(url) && !keep.includes(url)) URL.revokeObjectURL(url);
  };

  // Revoke the unsaved preview on unmount.
  const latest = React.useRef({ values, saved });
  latest.current = { values, saved };
  React.useEffect(
    () => () => {
      const { values: v, saved: s } = latest.current;
      if (isBlobUrl(v.avatarUrl) && v.avatarUrl !== s.avatarUrl) URL.revokeObjectURL(v.avatarUrl);
    },
    [],
  );

  const update = <K extends keyof ProfileSettingsValues>(key: K, value: ProfileSettingsValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (status.type !== 'saving') setStatus({ type: 'idle' });
  };

  const updateNotification = (key: keyof EmailNotifications, checked: boolean) => {
    update('notifications', { ...values.notifications, [key]: checked });
  };

  const handleAvatarFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Поддерживаются только PNG, JPG и WebP');
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      setAvatarError('Файл больше 5 МБ');
      return;
    }

    setAvatarError(null);
    releasePreview(values.avatarUrl, [saved.avatarUrl]);
    setAvatarFile(file);
    update('avatarUrl', URL.createObjectURL(file));
  };

  const { controlProps: fileControlProps, triggerProps: fileTriggerProps } = useFileInput({
    onUpdate: handleAvatarFiles,
  });

  const handleAvatarRemove = () => {
    releasePreview(values.avatarUrl, [saved.avatarUrl]);
    setAvatarFile(null);
    setAvatarError(null);
    update('avatarUrl', null);
  };

  const handleCancel = () => {
    releasePreview(values.avatarUrl, [saved.avatarUrl]);
    setValues(saved);
    setAvatarFile(null);
    setAvatarError(null);
    setSubmitAttempted(false);
    setStatus({ type: 'idle' });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving || !isDirty) return;

    setSubmitAttempted(true);
    const validationErrors = validate(values);
    const firstInvalid = (Object.keys(validationErrors) as (keyof FieldErrors)[])[0];
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }

    const payload: ProfileSettingsSubmit = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      avatarFile,
    };

    setStatus({ type: 'saving' });
    try {
      const result = await onSave(payload);
      releasePreview(saved.avatarUrl, [result.avatarUrl]);
      releasePreview(values.avatarUrl, [result.avatarUrl]);
      setSaved(result);
      setValues(result);
      setAvatarFile(null);
      setSubmitAttempted(false);
      setStatus({ type: 'success' });
    } catch (e) {
      setStatus({
        type: 'error',
        message: e instanceof Error && e.message ? e.message : 'Попробуйте ещё раз',
      });
    }
  };

  const avatarAlt = 'Аватар пользователя';
  const avatarSize = 'xl';

  return (
    <form className="profile-settings" onSubmit={handleSubmit} noValidate>
      <Card className="profile-settings__card" view="outlined">
        <Text as="h1" variant="header-2">
          Настройки профиля
        </Text>

        {/* ---------- Profile ---------- */}
        <fieldset className="profile-settings__section" disabled={isSaving}>
          <Text as="legend" variant="subheader-3" className="profile-settings__section-title">
            Профиль
          </Text>

          <div className="profile-settings__field">
            <Text as="span" variant="body-1" color="secondary">
              Аватар
            </Text>
            <div className="profile-settings__avatar">
              {values.avatarUrl ? (
                <Avatar size={avatarSize} imgUrl={values.avatarUrl} alt={avatarAlt} />
              ) : (
                <Avatar
                  size={avatarSize}
                  text={getInitials(values.name, values.email)}
                  theme="brand"
                  aria-label={avatarAlt}
                />
              )}
              <div className="profile-settings__avatar-controls">
                <div className="profile-settings__avatar-actions">
                  <input
                    {...fileControlProps}
                    id={FIELD_IDS.avatar}
                    accept={AVATAR_TYPES.join(',')}
                  />
                  <Button
                    view="outlined"
                    disabled={isSaving}
                    onClick={fileTriggerProps.onClick}
                    extraProps={{ 'aria-describedby': 'profile-avatar-hint' }}
                  >
                    {values.avatarUrl ? 'Заменить фото' : 'Загрузить фото'}
                  </Button>
                  {values.avatarUrl && (
                    <Button view="flat-danger" disabled={isSaving} onClick={handleAvatarRemove}>
                      Удалить
                    </Button>
                  )}
                </div>
                {avatarError ? (
                  <Text variant="caption-2" className="profile-settings__field-error" role="alert">
                    {avatarError}
                  </Text>
                ) : (
                  <Text id="profile-avatar-hint" variant="caption-2" color="secondary">
                    PNG, JPG или WebP, не больше 5 МБ
                  </Text>
                )}
              </div>
            </div>
          </div>

          <div className="profile-settings__field">
            <Text as="label" htmlFor={FIELD_IDS.name} variant="body-1" color="secondary">
              Имя
            </Text>
            <TextInput
              id={FIELD_IDS.name}
              size="l"
              value={values.name}
              onUpdate={(v) => update('name', v)}
              placeholder="Как к вам обращаться"
              autoComplete="name"
              validationState={errors.name ? 'invalid' : undefined}
              errorMessage={errors.name}
            />
          </div>

          <div className="profile-settings__field">
            <Text as="label" htmlFor={FIELD_IDS.email} variant="body-1" color="secondary">
              Email
            </Text>
            <TextInput
              id={FIELD_IDS.email}
              type="email"
              size="l"
              value={values.email}
              onUpdate={(v) => update('email', v)}
              placeholder="name@example.com"
              autoComplete="email"
              validationState={errors.email ? 'invalid' : undefined}
              errorMessage={errors.email}
            />
          </div>
        </fieldset>

        {/* ---------- Preferences ---------- */}
        <fieldset className="profile-settings__section" disabled={isSaving}>
          <Text as="legend" variant="subheader-3" className="profile-settings__section-title">
            Региональные настройки
          </Text>

          <div className="profile-settings__field">
            <Text as="label" htmlFor={FIELD_IDS.language} variant="body-1" color="secondary">
              Язык интерфейса
            </Text>
            <Select
              id={FIELD_IDS.language}
              size="l"
              width="max"
              options={LANGUAGE_OPTIONS}
              value={[values.language]}
              onUpdate={([v]) => v && update('language', v)}
              disabled={isSaving}
            />
          </div>

          <div className="profile-settings__field">
            <Text as="label" htmlFor={FIELD_IDS.timeZone} variant="body-1" color="secondary">
              Часовой пояс
            </Text>
            <Select
              id={FIELD_IDS.timeZone}
              size="l"
              width="max"
              filterable
              filterPlaceholder="Поиск: Moscow, UTC+03"
              options={TIME_ZONE_OPTIONS}
              value={[values.timeZone]}
              onUpdate={([v]) => v && update('timeZone', v)}
              disabled={isSaving}
            />
          </div>
        </fieldset>

        {/* ---------- Security ---------- */}
        <fieldset className="profile-settings__section" disabled={isSaving}>
          <Text as="legend" variant="subheader-3" className="profile-settings__section-title">
            Безопасность
          </Text>

          <div className="profile-settings__switch-row">
            <div>
              <Text as="div" id="profile-2fa-label" variant="body-2">
                Двухфакторная авторизация
              </Text>
              <Text as="div" id="profile-2fa-desc" variant="body-1" color="secondary">
                При входе дополнительно потребуется код из приложения-аутентификатора
              </Text>
            </div>
            <Switch
              id={FIELD_IDS.twoFactor}
              size="l"
              checked={values.twoFactorEnabled}
              onUpdate={(checked) => update('twoFactorEnabled', checked)}
              disabled={isSaving}
              controlProps={{
                'aria-labelledby': 'profile-2fa-label',
                'aria-describedby': 'profile-2fa-desc',
              }}
            />
          </div>
        </fieldset>

        {/* ---------- Notifications ---------- */}
        <fieldset className="profile-settings__section" disabled={isSaving}>
          <Text as="legend" variant="subheader-3" className="profile-settings__section-title">
            Email-уведомления
          </Text>

          {NOTIFICATION_ITEMS.map((item) => (
            <Checkbox
              key={item.key}
              size="l"
              checked={values.notifications[item.key]}
              onUpdate={(checked) => updateNotification(item.key, checked)}
              disabled={isSaving}
            >
              <Text variant="body-2" className="profile-settings__checkbox-title">
                {item.title}
              </Text>
              <Text variant="body-1" color="secondary">
                {item.description}
              </Text>
            </Checkbox>
          ))}
        </fieldset>

        {status.type === 'success' && (
          <Alert
            theme="success"
            message="Изменения сохранены"
            onClose={() => setStatus({ type: 'idle' })}
            className="profile-settings__alert"
          />
        )}
        {status.type === 'error' && (
          <Alert
            theme="danger"
            title="Не удалось сохранить изменения"
            message={status.message}
            onClose={() => setStatus({ type: 'idle' })}
            className="profile-settings__alert"
          />
        )}

        <div className="profile-settings__footer">
          <Button size="l" view="flat" onClick={handleCancel} disabled={!isDirty || isSaving}>
            Отмена
          </Button>
          <Button size="l" view="action" type="submit" loading={isSaving} disabled={!isDirty}>
            Сохранить
          </Button>
        </div>
      </Card>
    </form>
  );
}
