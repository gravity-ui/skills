import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Alert, Avatar, Button, Checkbox, Select, Switch, Text, TextInput } from '@gravity-ui/uikit';

import './ProfileSettingsPage.css';
import {
  AVATAR_ACCEPT,
  NOTIFICATION_KEYS,
  NOTIFICATION_LABELS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  getInitials,
  isProfileEqual,
  validateAvatarFile,
  validateProfile,
} from './model';
import type { NotificationKey, ProfileValues } from './model';

const LANGUAGE_SELECT_OPTIONS = LANGUAGE_OPTIONS.map((option) => ({
  value: option.value,
  content: option.label,
  text: option.label,
}));

const TIMEZONE_SELECT_OPTIONS = TIMEZONE_OPTIONS.map((tz) => ({
  value: tz,
  content: tz.replace(/_/g, ' '),
  text: tz,
}));

export interface ProfileSettingsPageProps {
  initialValues: ProfileValues;
  /**
   * Сохраняет профиль. Получает новые значения и выбранный файл аватара (или null).
   * Возвращает актуальные сохранённые значения; при ошибке — бросает исключение.
   */
  onSave: (values: ProfileValues, avatarFile: File | null) => Promise<ProfileValues>;
  /** Вызывается после отката изменений по кнопке «Отмена» (например, для перехода назад). */
  onCancel?: () => void;
}

type Feedback = { theme: 'success' | 'danger'; text: string };

export function ProfileSettingsPage({ initialValues, onSave, onCancel }: ProfileSettingsPageProps) {
  const [saved, setSaved] = useState<ProfileValues>(initialValues);
  const [values, setValues] = useState<ProfileValues>(initialValues);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Превью выбранного файла: object URL создаётся на время выбора и освобождается при замене/сбросе.
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const errors = validateProfile(values);
  const hasErrors = Object.keys(errors).length > 0;
  const isDirty = avatarFile !== null || !isProfileEqual(values, saved);
  const canSave = isDirty && !hasErrors && !isSaving;

  const update = <K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFeedback(null);
  };

  const updateNotification = (key: NotificationKey, checked: boolean) => {
    setValues((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: checked } }));
    setFeedback(null);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    // Сбрасываем значение инпута, чтобы можно было выбрать тот же файл повторно.
    event.target.value = '';
    if (!file) return;
    const error = validateAvatarFile(file);
    setAvatarError(error);
    if (!error) {
      setAvatarFile(file);
      setFeedback(null);
    }
  };

  const handleCancel = () => {
    setValues(saved);
    setAvatarFile(null);
    setAvatarError(null);
    setFeedback(null);
    onCancel?.();
  };

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setFeedback(null);
    const payload: ProfileValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    };
    try {
      const result = await onSave(payload, avatarFile);
      setSaved(result);
      setValues(result);
      setAvatarFile(null);
      setFeedback({ theme: 'success', text: 'Изменения сохранены' });
    } catch (error) {
      setFeedback({
        theme: 'danger',
        text: error instanceof Error ? error.message : 'Не удалось сохранить изменения',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSave();
  };

  const avatarSrc = avatarPreviewUrl ?? values.avatarUrl;

  return (
    <form className="profile-page" onSubmit={handleSubmit} noValidate>
      {/* Всё содержимое блокируется во время сохранения. */}
      <fieldset className="profile-form" disabled={isSaving}>
        <Text as="h1" variant="header-2">
          Настройки профиля
        </Text>

        <div className="profile-field">
          <Text as="span" variant="subheader-1">
            Аватар
          </Text>
          <div className="profile-avatar">
            {avatarSrc ? (
              <Avatar size="xl" imgUrl={avatarSrc} alt="Аватар" />
            ) : (
              <Avatar size="xl" text={getInitials(values.name)} />
            )}
            <div className="profile-avatar__actions">
              <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
                Загрузить аватар
              </Button>
              <Text variant="caption-1" color="hint">
                PNG, JPEG, WebP или GIF до 2 МБ
              </Text>
              {avatarError && (
                <Text variant="caption-1" color="danger">
                  {avatarError}
                </Text>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_ACCEPT}
              onChange={handleAvatarChange}
              hidden
            />
          </div>
        </div>

        <TextInput
          label="Имя"
          name="name"
          autoComplete="name"
          value={values.name}
          onUpdate={(value) => update('name', value)}
          errorMessage={errors.name}
          validationState={errors.name ? 'invalid' : undefined}
        />

        <TextInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onUpdate={(value) => update('email', value)}
          errorMessage={errors.email}
          validationState={errors.email ? 'invalid' : undefined}
        />

        <Select
          label="Язык интерфейса"
          width="max"
          options={LANGUAGE_SELECT_OPTIONS}
          value={[values.language]}
          onUpdate={([language]) => {
            if (language) update('language', language);
          }}
        />

        <Select
          label="Часовой пояс"
          width="max"
          filterable
          options={TIMEZONE_SELECT_OPTIONS}
          value={[values.timezone]}
          onUpdate={([timezone]) => {
            if (timezone) update('timezone', timezone);
          }}
        />

        <div className="profile-field">
          <Text as="span" variant="subheader-1">
            Двухфакторная авторизация
          </Text>
          <Switch
            checked={values.twoFactorEnabled}
            onUpdate={(checked) => update('twoFactorEnabled', checked)}
          >
            {values.twoFactorEnabled ? 'Включена' : 'Выключена'}
          </Switch>
        </div>

        <fieldset className="profile-notifications">
          <legend>
            <Text variant="subheader-1">Email-уведомления</Text>
          </legend>
          {NOTIFICATION_KEYS.map((key) => (
            <Checkbox
              key={key}
              checked={values.notifications[key]}
              onUpdate={(checked) => updateNotification(key, checked)}
            >
              {NOTIFICATION_LABELS[key]}
            </Checkbox>
          ))}
        </fieldset>

        {feedback && <Alert theme={feedback.theme} message={feedback.text} />}

        <div className="profile-actions">
          <Button view="action" type="submit" loading={isSaving} disabled={!canSave}>
            Сохранить
          </Button>
          <Button view="outlined" type="button" onClick={handleCancel}>
            Отмена
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
